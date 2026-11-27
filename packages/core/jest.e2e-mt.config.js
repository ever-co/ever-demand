// Multi-tenant API e2e suite (test/e2e/*.e2e-mt-spec.ts): boots the built API
// with MULTI_TENANT=true (its own database and ports, so it can run next to the
// single-tenant suite) and checks that tenants never see each other's records,
// over GraphQL, graphql-ws and socket.io.
//
//   pnpm --filter @ever-platform/core db:test:up
//   pnpm --filter @ever-platform/core build
//   pnpm --filter @ever-platform/core test:e2e:mt

process.env.CORE_E2E_MULTI_TENANT = 'true';
process.env.CORE_E2E_DB_NAME ||= 'ever_core_e2e_multi_tenant';
process.env.CORE_E2E_HTTPPORT ||= '15600';
process.env.CORE_E2E_HTTPSPORT ||= '12187';
process.env.CORE_E2E_GQLPORT ||= '18543';
process.env.CORE_E2E_GQLPORT_SUBSCRIPTIONS ||= '12186';
process.env.CORE_E2E_STRIPE_PORT ||= '12188';

const base = require('./jest.e2e.config.js');

/** @type {import('jest').Config} */
module.exports = {
	...base,
	testRegex: '\\.e2e-mt-spec\\.ts$',
};
