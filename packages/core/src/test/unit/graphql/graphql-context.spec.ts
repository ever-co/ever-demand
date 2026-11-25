import {
	createGraphQLContext,
	createWsGraphQLContext,
} from '../../../graphql/graphql-context';

describe('GraphQL context', () => {
	it('exposes the HTTP request of POST /graphql', () => {
		const req = { headers: { authorization: 'Bearer abc' } } as any;

		expect(createGraphQLContext({ req })).toEqual({ req });
	});

	describe('graphql-ws (connection_init payload)', () => {
		it.each([
			[{ authorization: 'Bearer abc' }, 'Bearer abc'],
			[{ Authorization: 'Bearer abc' }, 'Bearer abc'],
			[{ authorization: 'bearer abc' }, 'bearer abc'],
			[{ authorization: 'abc' }, 'Bearer abc'],
			[{ Authorization: 'abc' }, 'Bearer abc'],
		])('turns %j into the Authorization header %s', (params, header) => {
			expect(createWsGraphQLContext(params).req.headers.authorization).toBe(header);
		});

		it.each([[undefined], [{}], [{ authorization: '' }], [{ authorization: 42 }]])(
			'has no Authorization header for %j',
			(params) => {
				expect(createWsGraphQLContext(params as any).req.headers.authorization).toBeUndefined();
			}
		);

		it('keeps the headers of the upgrade request, the token of the payload wins', () => {
			const context = createWsGraphQLContext(
				{ authorization: 'payload-token' },
				{ 'user-agent': 'jest', authorization: 'Bearer upgrade-token' }
			);

			expect(context.req.headers).toEqual({
				'user-agent': 'jest',
				authorization: 'Bearer payload-token',
			});
		});
	});
});
