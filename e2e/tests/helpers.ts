/** Shared helpers for the e2e suites (API endpoints and a tiny GraphQL client). */
export const GQL_URL = process.env.E2E_GQL_URL || 'http://localhost:8443/graphql';
export const SERVICES_URL = process.env.E2E_SERVICES_URL || 'http://localhost:5500';
export const SUBSCRIPTIONS_URL = process.env.E2E_SUBSCRIPTIONS_URL || 'ws://localhost:2086/subscriptions';

/** Default admin created by the API on first boot. */
export const ADMIN = { email: 'admin@ever.co', password: 'admin' };

export async function gql<T = any>(
	query: string,
	variables: Record<string, unknown> = {},
	token?: string
): Promise<{ data?: T; errors?: { message: string }[] }> {
	const res = await fetch(GQL_URL, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			...(token ? { authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify({ query, variables }),
	});
	return res.json();
}

const cachedAdminTokens = new Map<string, Promise<string>>();

/**
 * Login token of an admin: by default the default admin (owner of the default
 * tenant), else the admin of `account`, e.g. a tenant's owner. The API refuses
 * admin operations without a login (graphql/access, socket access), so
 * fixtures log in; each account's token is cached (a token carries its
 * tenant, so one cache entry per admin, never one for all tenants).
 */
export function adminToken(account: { email: string; password: string } = ADMIN): Promise<string> {
	let token = cachedAdminTokens.get(account.email);

	if (!token) {
		token = (async () => {
			const res = await gql<{ adminLogin: { token: string } | null }>(
				`mutation L($email: String!, $password: String!) { adminLogin(email: $email, password: $password) { token } }`,
				account
			);
			const value = res.data?.adminLogin?.token;

			if (!value) {
				cachedAdminTokens.delete(account.email);
				throw new Error(`${account.email} could not log in: ${JSON.stringify(res.errors)}`);
			}

			return value;
		})();
		cachedAdminTokens.set(account.email, token);
	}

	return token;
}
