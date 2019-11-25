import { getSchema } from '@pyro/db';
import mongoose from 'mongoose';

export const modelMetadata = 'db:model';

export function getModel<Document extends mongoose.Document>(
	DBObject
): mongoose.Model<Document> {
	let Model = Reflect.getMetadata(modelMetadata, DBObject);

	if (Model == null) {
		Model = mongoose.model<Document>(
			DBObject.modelName,
			getSchema(DBObject)
		);
		Reflect.defineMetadata(modelMetadata, Model, DBObject);
	}

	return Model;
}
