import { getPreSchema } from './schema';
import { DBRawObject } from './db-raw-object';
import { DBCreateObject } from './db-create-object';
import { PyroObjectId } from './object-id';
import mongoose from 'mongoose';
import { toDate } from '../../utils';
import _ from 'lodash';
import { Column, PrimaryColumn } from 'typeorm';

export interface DBObjectClass extends Function {
	modelName?: string;
}

export abstract class DBObject<
	RawObject extends CreateObject & DBRawObject,
	CreateObject extends DBCreateObject
> implements DBRawObject {
	// to allow inferring the generic args types
	readonly CreateObjectTYPE: CreateObject;

	// to allow inferring the generic args types
	readonly RawObjectTYPE: RawObject;

	static modelName = '';

	constructor(obj: RawObject) {
		_.assign(this, obj);

		if (
			mongoose != null &&
			mongoose.Types != null &&
			mongoose.Types.ObjectId != null
		) {
			if (obj && obj['_id']) {
				this['_id'] = mongoose.Types.ObjectId.createFromHexString(
					obj['_id'].toString()
				);
			}
		}
	}

	@PrimaryColumn()
	_id: PyroObjectId;

	/**
	 * Time when entity was created
	 * Note: can be string too because send in socket io.
	 *
	 * @type {(Date | string)}
	 * @memberof DBObject
	 */
	@Column()
	_createdAt: Date | string;

	/**
	 * Time when entity was updated last time
	 *
	 * @type {(Date | string)}
	 * @memberof DBObject
	 */
	@Column()
	_updatedAt: Date | string;

	get createdAt(): Date {
		return this._createdAt != null ? toDate(this._createdAt) : null;
	}

	get updatedAt(): Date {
		return this._updatedAt != null ? toDate(this._updatedAt) : null;
	}

	get id(): string {
		return this._id.toString();
	}

	isEqual(p: this) {
		for (const prop in getPreSchema(this.constructor as any)) {
			if (this[prop] !== p[prop]) {
				return false;
			}
		}

		return true;
	}
}
