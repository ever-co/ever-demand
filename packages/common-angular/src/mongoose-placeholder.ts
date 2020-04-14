export type SchemaDefinition = any;

export class Schema {
	constructor(...args) {}

	index(
		fields: any,
		options?: {
			expires?: string;
			[other: string]: any;
		}
	) {
		return this;
	}

	pre() {
		return;
	}

	indexes(): any[] {
		return [];
	}
}

export const Types: any = {};

export default {
	Schema,
	Types,
};
