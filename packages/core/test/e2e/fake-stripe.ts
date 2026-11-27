import http from 'http';

/**
 * A fake of the few Stripe API endpoints the billing service calls
 * (customers, prices, subscriptions, Checkout and portal sessions), so the
 * e2e suite tests billing without the network. The API under test reaches
 * it through STRIPE_BILLING_API_URL (test/e2e/server.ts). Tests read and
 * change its state directly, e.g. to cancel a subscription "in Stripe".
 */
export class FakeStripe {
	readonly customers = new Map<string, any>();
	readonly subscriptions = new Map<string, any>();
	readonly sessions = new Map<string, any>();

	private readonly byIdempotencyKey = new Map<string, any>();
	private server?: http.Server;
	private next = 0;

	private id(prefix: string) {
		this.next += 1;
		return `${prefix}_fake_${Date.now().toString(36)}${this.next}`;
	}

	/** Adds or replaces a subscription "in Stripe". */
	setSubscription(subscription: any) {
		this.subscriptions.set(subscription.id, subscription);
	}

	sessionsOf(customer: string): any[] {
		return [...this.sessions.values()].filter((s) => s.customer === customer);
	}

	async listen(port: number): Promise<void> {
		this.server = http.createServer((req, res) => {
			let body = '';
			req.on('data', (chunk) => (body += chunk));
			req.on('end', () => {
				try {
					const [status, payload] = this.route(req, body);
					res.writeHead(status, { 'content-type': 'application/json' });
					res.end(JSON.stringify(payload));
				} catch (err) {
					res.writeHead(500, { 'content-type': 'application/json' });
					res.end(JSON.stringify({ error: { type: 'api_error', message: String(err) } }));
				}
			});
		});

		await new Promise<void>((resolve, reject) => {
			this.server!.once('error', reject);
			this.server!.listen(port, '127.0.0.1', () => resolve());
		});
	}

	async close(): Promise<void> {
		await new Promise<void>((resolve) => (this.server ? this.server.close(() => resolve()) : resolve()));
	}

	/** The routes, tried in order: `[method, path pattern, handler]`. */
	private readonly routes: Array<[string, RegExp, (r: FakeRequest) => Reply]> = [
		['POST', /^\/v1\/customers$/, (r) => this.createCustomer(r)],
		['GET', /^\/v1\/prices$/, (r) => this.listPrices(r)],
		['GET', /^\/v1\/subscriptions$/, (r) => this.listSubscriptions(r)],
		['GET', /^\/v1\/subscriptions\/([^/]+)$/, (r) => this.getSubscription(r)],
		['POST', /^\/v1\/checkout\/sessions$/, (r) => this.createSession(r)],
		['GET', /^\/v1\/checkout\/sessions\/([^/]+)$/, (r) => this.getSession(r)],
		['POST', /^\/v1\/checkout\/sessions\/([^/]+)\/expire$/, (r) => this.expireSession(r)],
		['POST', /^\/v1\/billing_portal\/sessions$/, () => this.createPortalSession()],
	];

	private route(req: http.IncomingMessage, body: string): Reply {
		// the base only lets URL parse the request path and query
		const url = new URL(req.url ?? '/', 'https://fake-stripe.invalid');
		const method = req.method ?? 'GET';

		for (const [routeMethod, pattern, handle] of this.routes) {
			const params = routeMethod === method ? pattern.exec(url.pathname) : null;

			if (params) {
				return handle({ req, url, form: new URLSearchParams(body), params });
			}
		}

		return missing(`route ${method} ${url.pathname}`);
	}

	/** A create answered once per Idempotency-Key, as Stripe does. */
	private idempotent(req: http.IncomingMessage, create: () => any): Reply {
		const key = req.headers['idempotency-key'];

		if (typeof key === 'string' && this.byIdempotencyKey.has(key)) {
			return [200, this.byIdempotencyKey.get(key)];
		}

		const created = create();

		if (typeof key === 'string') {
			this.byIdempotencyKey.set(key, created);
		}

		return [200, created];
	}

	private createCustomer({ req, form }: FakeRequest): Reply {
		return this.idempotent(req, () => {
			const customer = { id: this.id('cus'), object: 'customer', name: form.get('name') };
			this.customers.set(customer.id, customer);
			return customer;
		});
	}

	private listPrices({ url }: FakeRequest): Reply {
		const keys = [...url.searchParams.entries()].filter(([k]) => k.startsWith('lookup_keys')).map(([, v]) => v);

		return [
			200,
			list('/v1/prices', keys.map((key) => ({ id: `price_${key}`, object: 'price', lookup_key: key, active: true }))),
		];
	}

	private listSubscriptions({ url }: FakeRequest): Reply {
		const customer = url.searchParams.get('customer');

		return [
			200,
			list('/v1/subscriptions', [...this.subscriptions.values()].filter((s) => !customer || s.customer === customer)),
		];
	}

	private getSubscription({ params }: FakeRequest): Reply {
		const subscription = this.subscriptions.get(params[1]);
		return subscription ? [200, subscription] : missing('subscription');
	}

	private createSession({ req, form }: FakeRequest): Reply {
		return this.idempotent(req, () => {
			const id = this.id('cs');
			const session = {
				id,
				object: 'checkout.session',
				mode: form.get('mode'),
				customer: form.get('customer'),
				client_reference_id: form.get('client_reference_id'),
				status: 'open',
				url: `https://checkout.stripe.test/${id}`,
				expires_at: Math.floor(Date.now() / 1000) + 24 * 3600,
				line_items: [...form.entries()]
					.filter(([k]) => /^line_items\[\d+\]\[price\]$/.test(k))
					.map(([, price]) => price),
			};
			this.sessions.set(id, session);
			return session;
		});
	}

	private getSession({ params }: FakeRequest): Reply {
		const session = this.sessions.get(params[1]);
		return session ? [200, session] : missing('checkout session');
	}

	private expireSession({ params }: FakeRequest): Reply {
		const session = this.sessions.get(params[1]);

		if (!session) {
			return missing('checkout session');
		}

		if (session.status !== 'open') {
			return [400, { error: { type: 'invalid_request_error', message: 'Only open sessions can be expired' } }];
		}

		session.status = 'expired';
		session.url = null;

		return [200, session];
	}

	private createPortalSession(): Reply {
		const id = this.id('bps');
		return [200, { id, object: 'billing_portal.session', url: `https://billing.stripe.test/${id}` }];
	}
}

type Reply = [number, any];

interface FakeRequest {
	req: http.IncomingMessage;
	url: URL;
	form: URLSearchParams;
	/** The route pattern's match: `params[1]` is the id in the path */
	params: RegExpExecArray;
}

const missing = (what: string): Reply => [
	404,
	{ error: { type: 'invalid_request_error', code: 'resource_missing', message: `No such ${what}` } },
];

const list = (url: string, data: any[]) => ({ object: 'list', url, has_more: false, data });
