import { CombinedGraphQLErrors } from '@apollo/client';

/**
 * The GraphQL errors of a query / mutation result as a list (or `undefined` when there are none).
 *
 * Apollo Client 3 returned them as `result.errors`; Apollo Client 4 returns one `result.error`
 * (`CombinedGraphQLErrors` for GraphQL errors, any other error for network failures). The admin
 * screens were written against `errors`, so they read them through this helper.
 */
export function resultErrors(result: {
	errors?: readonly any[];
	error?: unknown;
}): readonly { message: string }[] | undefined {
	if (!result) {
		return undefined;
	}
	if (result.errors?.length) {
		return result.errors;
	}
	const error = result.error as any;
	if (!error) {
		return undefined;
	}
	if (CombinedGraphQLErrors.is(error)) {
		return error.errors.length
			? error.errors
			: [{ message: error.message }];
	}
	return [{ message: error.message ?? String(error) }];
}
