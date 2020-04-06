import { DBObject, DBObjectClass } from './db-object';
import 'reflect-metadata';
import * as _ from 'lodash';
import { Schema as MongooseSchema, SchemaDefinition } from 'mongoose';

const mongooseSchemasKey: string = 'mongooseSchemas';
const mongooseIndexesKey: string = 'mongooseIndexes';

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
