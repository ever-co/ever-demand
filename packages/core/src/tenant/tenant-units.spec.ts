import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { TenantContext } from './tenant-context';
import {
	hostName,
	isAvailableSlug,
	isValidSlug,
	slugFromHost,
} from './tenant-directory';
import {
	TenantScopedSubject,
	existenceEventTenantId,
} from './tenant-scoped-subject';
import { TenantScopedRepository } from './tenant-repository';
import { TenantMismatchError } from './tenant-plugin';
import {
	effectivePlan,
	isSeatLookupKey,
	memberLimit,
	parsePlanLookupKey,
	planLookupKey,
	seatLookupKey,
} from './plans';

const A = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const B = 'bbbbbbbbbbbbbbbbbbbbbbbb';

// these tests need "no tenant" to mean none (test/unit/setup-tenant.ts sets a fallback)
let savedFallback: string | null;
beforeEach(() => {
	savedFallback = TenantContext.getFallbackTenantId();
	TenantContext.setFallbackTenantId(null);
});
afterEach(() => TenantContext.setFallbackTenantId(savedFallback));

describe('tenant hosts and slugs', () => {
	it.each([
		['acme.everdemand.co', 'everdemand.co', 'acme'],
		['ACME.EverDemand.co.', 'everdemand.co', 'acme'],
		['acme.everdemand.co:443', 'everdemand.co', 'acme'],
		['https://acme.everdemand.co/shop?x=1', 'everdemand.co', 'acme'],
		['app.everdemand.co', 'everdemand.co', null],
		['api.everdemand.co', 'everdemand.co', null],
		['www.everdemand.co', 'everdemand.co', null],
		['a.b.everdemand.co', 'everdemand.co', null],
		['everdemand.co', 'everdemand.co', null],
		['acme.evil-everdemand.co', 'everdemand.co', null],
		['acme.everdemand.co', '', null],
		['localhost', 'everdemand.co', null],
	])('%s on %s → %s', (host, base, slug) => {
		expect(slugFromHost(host, base)).toBe(slug);
	});

	it('normalises host names', () => {
		expect(hostName('Shop.Example.com:8080')).toBe('shop.example.com');
		expect(hostName('http://[bad')).toBe('');
		expect(hostName(undefined)).toBe('');
	});

	it('accepts 3-40 lower-case letters, digits and single dashes, not at the ends', () => {
		for (const ok of ['abc', 'pizza-place', 'a1-b2', 'x'.repeat(40)]) {
			expect(isValidSlug(ok)).toBe(true);
		}

		for (const bad of [
			'ab',
			'-abc',
			'abc-',
			'a--b',
			'ABC',
			'a b',
			'x'.repeat(41),
			'ünï',
		]) {
			expect(isValidSlug(bad)).toBe(false);
		}
	});

	it('keeps platform names for the platform', () => {
		for (const reserved of [
			'app',
			'api',
			'www',
			'admin',
			'default',
			'billing',
		]) {
			expect(isAvailableSlug(reserved)).toBe(false);
		}
		expect(isAvailableSlug('acme')).toBe(true);
	});
});

describe('plans', () => {
	it('builds and parses the Stripe lookup keys', () => {
		expect(planLookupKey('small_business', 'annual')).toBe(
			'ever_demand_cloud_small_business_annual',
		);
		expect(seatLookupKey('enterprise', 'monthly')).toBe(
			'ever_seat_demand_cloud_enterprise_monthly',
		);
		expect(
			parsePlanLookupKey('ever_demand_cloud_enterprise_monthly'),
		).toEqual({
			plan: 'enterprise',
			interval: 'monthly',
		});
		expect(
			parsePlanLookupKey('ever_works_cloud_enterprise_monthly'),
		).toBeNull();
		expect(parsePlanLookupKey(null)).toBeNull();
		expect(
			isSeatLookupKey('ever_seat_demand_cloud_small_business_annual'),
		).toBe(true);
		expect(
			isSeatLookupKey('ever_seat_gauzy_cloud_small_business_annual'),
		).toBe(false);
	});

	it('counts bought members on paid plans only', () => {
		expect(memberLimit('starter', { extraMembers: 10 })).toBe(15);
		expect(memberLimit('small_business', { extraMembers: 10 })).toBe(35);
		expect(memberLimit('enterprise', {})).toBe(50);
	});

	it('falls back to Starter after a cancellation or a long past-due, never before', () => {
		const now = Date.parse('2026-11-26T00:00:00Z');
		const day = 86_400_000;
		const sub = { stripeSubscriptionId: 'sub_1' };

		expect(
			effectivePlan(
				'small_business',
				{ ...sub, status: 'active' },
				14,
				now,
			),
		).toBe('small_business');
		expect(
			effectivePlan(
				'small_business',
				{ ...sub, status: 'trialing' },
				14,
				now,
			),
		).toBe('small_business');
		expect(
			effectivePlan(
				'small_business',
				{ ...sub, status: 'canceled' },
				14,
				now,
			),
		).toBe('starter');
		expect(
			effectivePlan(
				'small_business',
				{
					...sub,
					status: 'past_due',
					pastDueSince: new Date(now - 13 * day),
				},
				14,
				now,
			),
		).toBe('small_business');
		expect(
			effectivePlan(
				'small_business',
				{
					...sub,
					status: 'past_due',
					pastDueSince: new Date(now - 15 * day),
				},
				14,
				now,
			),
		).toBe('starter');
		// a paid plan set without a subscription (super-admin, default tenant) stays
		expect(effectivePlan('enterprise', {}, 14, now)).toBe('enterprise');
		expect(effectivePlan(undefined, undefined, 14, now)).toBe('starter');
	});
});

describe('TenantScopedSubject', () => {
	const event = (tenantId?: string, id = 'x') => ({
		id,
		value: tenantId ? { tenantId } : null,
		lastValue: null,
	});

	it("delivers only the subscriber's tenant, plus records without a tenant", () => {
		const subject = new TenantScopedSubject<any>(existenceEventTenantId);
		const seenA: any[] = [];
		const seenB: any[] = [];

		TenantContext.runInTenant(A, () =>
			subject.subscribe((e) => seenA.push(e.id)),
		);
		TenantContext.runInTenant(B, () =>
			subject.subscribe((e) => seenB.push(e.id)),
		);

		subject.next(event(A, 'a1'));
		subject.next(event(B, 'b1'));
		subject.next(event(undefined, 'global'));

		expect(seenA).toEqual(['a1', 'global']);
		expect(seenB).toEqual(['b1', 'global']);
	});

	it("runs the subscriber's callbacks in its own tenant, whoever emits", () => {
		const subject = new TenantScopedSubject<any>(existenceEventTenantId);
		const tenantsSeen: Array<string | null> = [];

		TenantContext.runInTenant(A, () =>
			subject.subscribe(() => tenantsSeen.push(TenantContext.tenantId())),
		);

		TenantContext.runInTenant(B, () => subject.next(event(A)));
		TenantContext.runAsSystem('test', () => subject.next(event(A)));

		expect(tenantsSeen).toEqual([A, A]);
	});

	it('gives a subscriber without a tenant no tenant-owned record', () => {
		const subject = new TenantScopedSubject<any>(existenceEventTenantId);
		const seen: any[] = [];

		subject.subscribe((e) => seen.push(e.id));
		subject.next(event(A, 'a1'));

		expect(seen).toEqual([]);
	});

	it('lets go of the subject when an operator chain unsubscribes', () => {
		const subject = new TenantScopedSubject<any>(existenceEventTenantId);

		TenantContext.runInTenant(A, () => {
			subject.pipe(take(1)).subscribe(() => undefined);
			const direct = subject.subscribe(() => undefined);
			direct.unsubscribe();
		});

		expect(subject.observed).toBe(true);
		subject.next(event(A, 'a1'));
		expect(subject.observed).toBe(false);
	});

	it('keeps filtering through piped operators', () => {
		const subject = new TenantScopedSubject<any>(existenceEventTenantId);
		const seen: any[] = [];
		const source: Subject<any> = subject;

		TenantContext.runInTenant(A, () =>
			source.pipe().subscribe({ next: (e) => seen.push(e.id) }),
		);

		subject.next(event(B, 'b1'));
		subject.next(event(A, 'a1'));

		expect(seen).toEqual(['a1']);
	});
});

describe('TenantScopedRepository', () => {
	function fakeRepository() {
		const calls: Array<[string, any[]]> = [];
		const record = (name: string) =>
			jest.fn((...args: any[]) => {
				calls.push([name, args]);
				return Promise.resolve(args[0]);
			});

		return {
			calls,
			repo: {
				find: record('find'),
				findBy: record('findBy'),
				findOne: record('findOne'),
				findOneBy: record('findOneBy'),
				count: record('count'),
				countBy: record('countBy'),
				save: record('save'),
				insert: record('insert'),
				update: record('update'),
				delete: record('delete'),
			} as any,
		};
	}

	it('adds the tenant to every read, update and delete', async () => {
		const { repo, calls } = fakeRepository();
		const scoped = new TenantScopedRepository<any>(repo, 'Admin');

		await TenantContext.runInTenant(A, async () => {
			await scoped.find({ where: { email: 'x' } });
			await scoped.findOneBy({ email: 'x' });
			await scoped.count();
			await scoped.update('id1', { name: 'n', tenantId: B });
			await scoped.delete({ email: 'x' });
		});

		expect(calls).toEqual([
			['find', [{ where: { email: 'x', tenantId: A } }]],
			['findOneBy', [{ email: 'x', tenantId: A }]],
			['count', [{ where: { tenantId: A } }]],
			['update', [{ _id: 'id1', tenantId: A }, { name: 'n' }]],
			['delete', [{ email: 'x', tenantId: A }]],
		]);
	});

	it('stamps saves and refuses records of another tenant', async () => {
		const { repo, calls } = fakeRepository();
		const scoped = new TenantScopedRepository<any>(repo, 'Admin');

		await TenantContext.runInTenant(A, async () => {
			await scoped.save({ email: 'x' });
			expect(() => scoped.save({ email: 'y', tenantId: B })).toThrow(
				TenantMismatchError,
			);
		});

		expect(calls).toEqual([['save', [{ email: 'x', tenantId: A }]]]);
	});

	it('refuses to run without a tenant, and leaves system work alone', async () => {
		const { repo, calls } = fakeRepository();
		const scoped = new TenantScopedRepository<any>(repo, 'Admin');

		expect(() => scoped.count()).toThrow(/No tenant/);

		await TenantContext.runAsSystem('test', () => scoped.count());
		expect(calls).toEqual([['count', [{ where: undefined }]]]);
	});
});
