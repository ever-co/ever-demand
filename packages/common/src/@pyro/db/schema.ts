import { DBObject, DBObjectClass } from './db-object';
import 'reflect-metadata';
import * as _ from 'lodash';
import { Schema as MongooseSchema, SchemaDefinition } from 'mongoose';

const mongooseSchemasKey: string = 'mongooseSchemas';
const mongooseIndexesKey: string = 'mongooseIndexes';
const mongooseCompoundIndexesKey: string = 'mongooseCompoundIndexes';

export interface CompoundIndexDefinition {
	fields: Record<string, 1 | -1 | '2dsphere' | 'text'>;
	options?: Record<string, unknown>;
}

export function Schema(schema: any): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		let mongooseSchemas = Reflect.getMetadata(
			mongooseSchemasKey,
			target.constructor
		);

		if (typeof mongooseSchemas === 'undefined' || mongooseSchemas == null) {
			mongooseSchemas = {};
		}

		mongooseSchemas[propertyKey] = schema;

		Reflect.defineMetadata(
			mongooseSchemasKey,
			mongooseSchemas,
			target.constructor
		);
	};
}

export function Index(value: string | number): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		let indexesObj = Reflect.getMetadata(
			mongooseIndexesKey,
			target.constructor
		);

		if (typeof indexesObj === 'undefined' || indexesObj == null) {
			indexesObj = {};
		}

		indexesObj[propertyKey] = value;

		Reflect.defineMetadata(
			mongooseIndexesKey,
			indexesObj,
			target.constructor
		);
	};
}

/**
 * Class decorator: adds an index over several fields, e.g.
 * `@CompoundIndex({ tenantId: 1, email: 1 }, { unique: true })`. May be used
 * more than once on a class.
 */
export function CompoundIndex(
	fields: CompoundIndexDefinition['fields'],
	options?: CompoundIndexDefinition['options']
): ClassDecorator {
	return (target) => {
		const own: CompoundIndexDefinition[] =
			Reflect.getOwnMetadata(mongooseCompoundIndexesKey, target) ?? [];

		Reflect.defineMetadata(
			mongooseCompoundIndexesKey,
			[...own, { fields, options }],
			target
		);
	};
}

export function getCompoundIndexes(
	DBObj: DBObjectClass
): CompoundIndexDefinition[] {
	return Reflect.getOwnMetadata(mongooseCompoundIndexesKey, DBObj) ?? [];
}

export function getPreSchema(DBObj: DBObjectClass): SchemaDefinition {
	const mongooseSchemas = Reflect.getMetadata(mongooseSchemasKey, DBObj);

	if (mongooseSchemas != null) {
		return mongooseSchemas;
	} else {
		return {};
	}
}

export function getSchema(DBObj: DBObjectClass): MongooseSchema {
	const preSchema = getPreSchema(DBObj);

	const schema = new MongooseSchema(preSchema, {
		timestamps: {
			createdAt: '_createdAt',
			updatedAt: '_updatedAt',
		},
	});

	const mongooseIndexes = Reflect.getMetadata(mongooseIndexesKey, DBObj);

	if (mongooseIndexes != null) {
		schema.index(mongooseIndexes);
	}

	for (const { fields, options } of getCompoundIndexes(DBObj)) {
		schema.index(fields as any, options as any);
	}

	_.each(preSchema, (SubType: any, property) => {
		if (SubType.prototype instanceof DBObject) {
			// check if SubType extends DBObject
			_.each(getSchema(SubType).indexes(), (index: any) => {
				_.each(index, (indexValue: any, indexProperty: string) => {
					schema.index({
						[property + '.' + indexProperty]: indexValue,
					});
				});
			});
		}
	});

	return schema;
}
