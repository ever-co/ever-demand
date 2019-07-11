import { PyroObjectId } from './object-id';
import { DBObject } from '@pyro/db/db-object';

export interface DBCreateObject {
	_id?: PyroObjectId | string;
}

export type CreateObject<T extends DBObject<any, any>> = T['CreateObjectTYPE'];
