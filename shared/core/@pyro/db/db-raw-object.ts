import { PyroObjectId } from './object-id';
import { DBCreateObject } from './db-create-object';
import { DBObject } from '@pyro/db/db-object';

/**
 * Data Transfer Object (DTO)
 */
export interface DBRawObject extends DBCreateObject {
	_id: PyroObjectId;
	_createdAt: Date | string;
	_updatedAt: Date | string;
}

export type RawObject<T extends DBObject<any, any>> = T['CreateObjectTYPE'];
