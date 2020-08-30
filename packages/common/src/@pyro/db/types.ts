import { Schema } from './schema';

export const Types = {
	String: (s?: string) => {
		if (s == null) {
			return Schema({ type: String, required: true });
		} else {
			return Schema({ type: String, default: s });
		}
	},

	Number: (n?: number) => {
		if (n == null) {
			return Schema({ type: Number, required: true });
		} else {
			return Schema({ type: Number, default: n });
		}
	},

	Boolean: (b?: boolean) => {
		if (b == null) {
			return Schema({ type: Boolean, required: true });
		} else {
			return Schema({ type: Boolean, default: b });
		}
	},

	Date: (d?: number | ((n: number) => void)) => {
		if (d == null) {
			return Schema({ type: Date, required: true });
		} else {
			return Schema({ type: Date, default: d });
		}
	},

	Ref(Type: any, options: any = {}): PropertyDecorator {
		return (target: object, propertyKey: string | symbol) => {
			const multi = Array.isArray(Type);

			const op = { ...options };
			op.type = String;
			op.ref = (multi ? Type[0] : Type).modelName;

			Schema(multi ? [op] : op)(target, propertyKey);
		};
	},
};
