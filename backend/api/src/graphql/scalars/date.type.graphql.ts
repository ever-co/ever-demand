import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const DateScalar = new GraphQLScalarType({
	name: 'Date',
	parseValue(value: string | number | Date) {
		return new Date(value); // value from the client
	},
	serialize(value: { getTime: () => void }) {
		return value.getTime(); // value sent to the client
	},
	parseLiteral(ast: { kind: any; value: string | number | Date }) {
		if (ast.kind === Kind.INT) {
			return new Date(ast.value); // ast value is always in string format
		}
		return null;
	}
});
