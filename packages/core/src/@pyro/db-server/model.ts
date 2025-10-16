import { getSchema } from '@pyro/db';
import mongoose from 'mongoose';

export const modelMetadata = 'db:model';

export function getModel<Document extends mongoose.Document>(
	DBObject
): mongoose.Model<Document> {
	let Model = Reflect.getMetadata(modelMetadata, DBObject);

	if (Model == null) {

		const modelName = DBObject.modelName;

		console.log('MongoDB Model Name: ' + modelName);

		const schema = getSchema(DBObject);

		try
		{
			Model = mongoose.model<Document>(modelName, schema);
			Reflect.defineMetadata(modelMetadata, Model, DBObject);
		} catch (e) {
			console.log('MongoDB Schema with issues: ' + JSON.stringify(schema));
			console.error(e);
		}
	}

	return Model;
}
