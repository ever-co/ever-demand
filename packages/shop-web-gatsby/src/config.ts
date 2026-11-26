/**
 * Settings of the shop, from GATSBY_* env vars (Gatsby inlines only GATSBY_ prefixed
 * variables into the browser bundle). Defaults match the Angular shop and the local API.
 */
function toNumber(value: string | undefined): number | null {
	const parsed = parseFloat(value ?? '');
	return Number.isFinite(parsed) ? parsed : null;
}

export const config = {
	/** GraphQL endpoint of the Ever API. */
	gqlEndpoint:
		process.env.GATSBY_GQL_ENDPOINT || 'http://localhost:8443/graphql',

	/** Fixed location of the visitor; without it the browser location is asked for. */
	defaultLatitude: toNumber(process.env.GATSBY_DEFAULT_LATITUDE),
	defaultLongitude: toNumber(process.env.GATSBY_DEFAULT_LONGITUDE),

	/** Used when there is no fixed location and the browser gives none (Sofia, like the API seed). */
	fallbackLatitude: 42.6459136,
	fallbackLongitude: 23.3332736,

	/** Google Maps JS API key; without one the login page shows no map. */
	googleMapsApiKey: process.env.GATSBY_GOOGLE_MAPS_API_KEY || '',
};

export type ShopConfig = typeof config;
