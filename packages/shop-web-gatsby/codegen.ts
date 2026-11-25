import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Typed GraphQL documents (client preset). The schema is read from the API sources
 * (packages/core/src/graphql), so no running API is needed. Run `pnpm codegen` after
 * changing a query or the schema; src/gql is generated and committed.
 */
const config: CodegenConfig = {
	schema: '../core/src/graphql/**/*.graphql',
	documents: ['src/**/*.{ts,tsx}', '!src/gql/**/*', '!src/**/*.test.{ts,tsx}'],
	ignoreNoDocuments: false,
	generates: {
		'./src/gql/': {
			preset: 'client',
			presetConfig: {
				gqlTagName: 'gql',
				fragmentMasking: false,
			},
			config: {
				scalars: { Date: 'string', Any: 'any', Void: 'void' },
				enumsAsTypes: true,
				useTypeImports: true,
			},
		},
	},
};

export default config;
