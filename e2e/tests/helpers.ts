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

let cachedAdminToken: Promise<string> | undefined;

/**
 * Login token of the default admin. The API refuses admin operations
 * without a login (graphql/access, socket access), so fixtures use it.
 */
export function adminToken(): Promise<string> {
	cachedAdminToken ??= (async () => {
		const res = await gql<{ adminLogin: { token: string } | null }>(
			`mutation L($email: String!, $password: String!) { adminLogin(email: $email, password: $password) { token } }`,
			ADMIN
		);
		const token = res.data?.adminLogin?.token;

		if (!token) {
			cachedAdminToken = undefined;
			throw new Error(`default admin could not log in: ${JSON.stringify(res.errors)}`);
		}

		return token;
	})();

	return cachedAdminToken;
}
