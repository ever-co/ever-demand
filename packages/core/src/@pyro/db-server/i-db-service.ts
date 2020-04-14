import { Subject, Observable } from 'rxjs';
import { ExistenceEvent } from './existence';
import mongoose from 'mongoose';
import { DBObject } from '@pyro/db';
import { RawObject } from '@pyro/db/db-raw-object';
import { CreateObject } from '@pyro/db/db-create-object';
import { FindObject } from '@pyro/db/db-find-object';
import { UpdateObject } from '@pyro/db/db-update-object';

export interface IDbService<T extends DBObject<any, any>> {
	readonly DBObject: { new (arg: RawObject<T>): T; modelName: string };

	readonly Model: mongoose.Model<RawObject<T> & mongoose.Document>;

	readonly existence: Subject<ExistenceEvent<T>>;

	create(createObject: CreateObject<T>): Promise<T>;

	remove(objectId: string): Promise<void>;

	removeMultiple(conditions: FindObject<T>): Promise<void>;

	removeAll(): Promise<void>;

	get(objectId: string): Observable<T | null>;

	getCurrent(objectId: string): Promise<T | null>;

	getMultiple(ids: string[]): Observable<T[]>;

	getCurrentMultiple(objectIds: string[]): Promise<T[]>;

	find(conditions: FindObject<T>): Promise<T[]>;

	findOne(conditions: FindObject<T>): Promise<T | null>;

	update(objectId: string, updateObj: UpdateObject<T>): Promise<T>;

	updateMultiple(findObj: any, updateObj: UpdateObject<T>): Promise<T[]>;

	updateMultipleByIds(
		ids: string[],
		updateObj: UpdateObject<T>
	): Promise<T[]>;

	count(conditions: FindObject<T>): Promise<number>;
}
