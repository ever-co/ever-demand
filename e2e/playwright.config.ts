import { defineConfig, devices } from '@playwright/test';

/**
 * One Playwright project per app. Each project expects its app (and the API) to be running;
 * the URLs come from env vars so CI and local runs can point at any host.
 *
 *   API:       E2E_GQL_URL (default http://localhost:8443/graphql), E2E_SERVICES_URL (http://localhost:5500)
 *   admin:     E2E_ADMIN_URL    (http://localhost:4200)
 *   shop web:  E2E_SHOP_WEB_URL (http://localhost:3000)
 *   shop mob:  E2E_SHOP_MOBILE_URL (http://localhost:4201)
 *   merchant:  E2E_MERCHANT_URL (http://localhost:4202)
 *   carrier:   E2E_CARRIER_URL  (http://localhost:4203)
 *   expo web:  E2E_SHOP_EXPO_URL (http://localhost:8081)
 *
 * multi-tenant: the admin app (E2E_MT_ADMIN_URL, http://localhost:4200) against an API started
 *   with MULTI_TENANT=true and TENANT_BASE_DOMAIN=everdemand.test (E2E_MT_GQL_URL, default
 *   http://localhost:8443/graphql); the specs skip when that API is not in multi-tenant mode.
 */
const env = (name: string, fallback: string) => process.env[name] || fallback;

export default defineConfig({
	testDir: './tests',
	timeout: 60_000,
	expect: { timeout: 15_000 },
	fullyParallel: false,
	workers: 1,
	retries: process.env.CI ? 1 : 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		ignoreHTTPSErrors: true,
	},
	projects: [
		{ name: 'api', testDir: './tests/api' },
		{ name: 'admin', testDir: './tests/admin', use: { ...devices['Desktop Chrome'], baseURL: env('E2E_ADMIN_URL', 'http://localhost:4200') } },
		{ name: 'shop-web', testDir: './tests/shop-web', use: { ...devices['Desktop Chrome'], baseURL: env('E2E_SHOP_WEB_URL', 'http://localhost:3000') } },
		{ name: 'shop-mobile', testDir: './tests/shop-mobile', use: { ...devices['Pixel 7'], baseURL: env('E2E_SHOP_MOBILE_URL', 'http://localhost:4201') } },
		{ name: 'merchant', testDir: './tests/merchant', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, baseURL: env('E2E_MERCHANT_URL', 'http://localhost:4202') } },
		{ name: 'carrier', testDir: './tests/carrier', use: { ...devices['Pixel 7'], baseURL: env('E2E_CARRIER_URL', 'http://localhost:4203') } },
		{ name: 'shop-expo', testDir: './tests/shop-expo', use: { ...devices['Pixel 7'], baseURL: env('E2E_SHOP_EXPO_URL', 'http://localhost:8081') } },
		{ name: 'multi-tenant', testDir: './tests/multi-tenant', use: { ...devices['Desktop Chrome'], baseURL: env('E2E_MT_ADMIN_URL', 'http://localhost:4200') } },
	],
});
