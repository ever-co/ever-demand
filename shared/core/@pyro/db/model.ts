import { DBObjectClass } from './db-object';

export function ModelName(name: string): ClassDecorator {
	return (target: DBObjectClass) => {
		target.modelName = name;
	};
}
