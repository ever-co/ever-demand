import { IDbService } from './i-db-service';
import { Model, Document } from 'mongoose';
import { Subject, Observable, from, of } from 'rxjs';
import { ExistenceEvent, ExistenceEventType } from './existence';
import { DBObject } from '@pyro/db';
import { inject, injectable, optional, interfaces } from 'inversify';
import { Repository, getRepository } from 'typeorm';
import * as uuid from 'uuid';
import * as Logger from 'bunyan';
import * as _ from 'lodash';

import { RawObject } from '@pyro/db/db-raw-object';
import { createEverLogger } from '../../helpers/Log';
import { filter, map, share, concat, tap, exhaustMap } from 'rxjs/operators';

@injectable()
export class TypeORMService<T extends DBObject<any, any>>
	implements IDbService<T> {
	DBObject: { new (arg: T['CreateObjectTYPE']): T; modelName: string };

	// TODO: Refactor IDbService so Model is not of type Model<T["CreateObjectTYPE"] & Document, {}>
	Model: Model<T['CreateObjectTYPE'] & Document, {}>;
	existence: Subject<ExistenceEvent<T>>;
	protected readonly log: Logger = createEverLogger({ name: 'adminService' });

	constructor(
		@optional()
		private _repository: Repository<T>
	) {
		this.existence = new Subject<ExistenceEvent<T>>();
	}

	async create(createObject: T['CreateObjectTYPE']): Promise<T> {
		const callId = uuid();

		this.log.info({ callId, createObject }, '.create(createObject) called');

		let object;

		try {
			object = this._repository.create(createObject);
			this._repository.save(object);
		} catch (error) {
			this.log.error(
				{ callId, createObject, error },
				'.create(createObject) thrown error!'
			);
			throw error;
		}

		this.existence.next({
			id: object.id,
			value: object,
			lastValue: null,
			type: ExistenceEventType.Created
		});

		this.log.info(
			{ callId, createObject, object },
			'.create(createObject) created object'
		);

		return object as T;
	}
	async remove(objectId: string): Promise<void> {
		const callId = uuid();

		this.log.info({ callId }, '.removeAll() called!');

		try {
			const object = await this._repository.findByIds([objectId]);
			await this.repository.remove(object[0]);
		} catch (err) {
			this.log.error({ callId, err }, '.remove() thrown error!');
			throw err;
		}

		this.log.info({ callId }, '.removeAll() removed all!');
	}
	async removeMultiple(conditions: any): Promise<void> {
		const callId = uuid();

		this.log.info(
			{ callId, conditions },
			'.removeMultiple(conditions) called'
		);

		let lastValues: T[];

		try {
			lastValues = await this._repository.find(conditions);
			await this._repository.remove(lastValues);
		} catch (err) {
			this.log.error(
				{ callId, conditions, err },
				'.removeMultiple(conditions) thrown error!'
			);
			throw err;
		}

		lastValues.forEach((lastValue) => {
			this.existence.next({
				id: lastValue.id,
				lastValue,
				value: null,
				type: ExistenceEventType.Removed
			});
		});

		this.log.info(
			{
				callId,
				conditions,
				lastValues
			},
			'.removeMultiple(conditions) removed objects'
		);
	}
	async removeAll(): Promise<void> {
		const callId = uuid();

		this.log.info({ callId }, '.removeAll() called!');

		try {
			const objects = await this._repository.find();
			await this._repository.remove(objects);
		} catch (err) {
			this.log.error({ callId, err }, '.removeAll() thrown error!');
			throw err;
		}

		this.log.info({ callId }, '.removeAll() removed all!');
	}
	get(id: string): Observable<T> {
		const callId = uuid();

		this.log.info({ objectId: id, callId }, '.get(id) called');

		return from(this.getCurrent(id)).pipe(
			concat(
				this.existence.pipe(
					filter((existenceEvent) => id === existenceEvent.id),
					map((existenceEvent) => existenceEvent.value),
					share()
				)
			),
			tap({
				next: (obj) => {
					this.log.info(
						{
							objectId: id,
							object: obj,
							callId
						},
						'.get(id) emitted next value'
					);
				},
				error: (err) => {
					this.log.error(
						{
							objectId: id,
							err,
							callId
						},
						'.get(id), emitted error!'
					);
				}
			})
		);
	}
	async getCurrent(id: string): Promise<T> {
		const callId = uuid();

		this.log.info({ objectId: id, callId }, '.getCurrent(id) called');

		const obj = await this._repository.findByIds([id])[0];

		return obj as RawObject<T>;
	}
	getMultiple(ids: string[]): Observable<T[]> {
		const callId = uuid();

		this.log.info({ objectIds: ids, callId }, '.getMultiple(ids) called');

		return of(null).pipe(
			concat(
				this.existence.pipe(
					filter((event) => _.includes(ids, event.id)),
					share()
				)
			),
			exhaustMap(() => this.getCurrentMultiple(ids)),
			tap({
				next: (objects) => {
					this.log.info(
						{ objectIds: ids, objects, callId },
						'.getMultiple(ids) emitted next value'
					);
				},
				error: (err) => {
					this.log.error(
						{ objectIds: ids, err, callId },
						'.getMultiple(ids), emitted error!'
					);
				}
			})
		);
	}
	async getCurrentMultiple(ids: string[]): Promise<T[]> {
		const callId = uuid();

		this.log.info(
			{ objectIds: ids, callId },
			'.getCurrentMultiple(ids) called'
		);

		const objs = await this._repository.findByIds(ids);

		return objs;
	}
	find(conditions: any): Promise<T[]> {
		return this._repository.find({ ...conditions });
	}
	findOne(conditions: any): Promise<T> {
		return this._repository.findOne(conditions);
	}

	async update(id: string, updateObj: any): Promise<T> {
		const callId = uuid();
		this.log.info(
			{ callId, id, updateObj },
			'.update(id, updateObj) called'
		);

		let beforeUpdateObject: T | null;

		let updatedObject: T;

		try {
			beforeUpdateObject = await this.getCurrent(id);

			if (beforeUpdateObject != null) {
				// const obj = (await this.Model.findByIdAndUpdate(
				// 	id,
				// 	updateObj as any,
				// 	{ new: true }
				// )
				// 	.lean()
				// 	.exec()) as RawObject<T>;
				let tempObject = await this._repository.update(id, {
					...updateObj
				});
				updatedObject = tempObject as RawObject<T>;
			} else {
				throw new Error(
					`There is no such object with the id ${beforeUpdateObject}`
				);
			}
		} catch (err) {
			this.log.error(
				{ callId, id, updateObj, err },
				'.update(id, updateObj) thrown error!'
			);
			throw err;
		}

		this.existence.next({
			id: id,
			value: updatedObject,
			lastValue: beforeUpdateObject,
			type: ExistenceEventType.Updated
		});

		this.log.info(
			{
				callId,
				id,
				updateObj,
				updatedValue: updatedObject,
				lastValue: beforeUpdateObject
			},
			'.update(objectId, updateObj) updated object'
		);

		return updatedObject;
	}
	async updateMultiple(findObj: any, updateObj: any): Promise<T[]> {
		const callId = uuid();
		this.log.info(
			{ callId, findObj, updateObj },
			'.updateMultiple(findObj, updateObj) called'
		);

		let lastValues: any[];
		let updatedObjects: any[];

		try {
			lastValues = await this.find(findObj);

			lastValues.forEach((obj) => {
				obj = { ...obj, ...updateObj };
				obj.save();
				updatedObjects.push(obj);
			});
		} catch (err) {
			this.log.error(
				{ callId, findObj, updateObj, err },
				'.updateMultiple(findObj, updateObj) thrown error!'
			);
			throw err;
		}

		lastValues.forEach((lastValue) => {
			const newValue = _.find(
				updatedObjects,
				(obj) => obj.id === lastValue.id
			) as T;

			this.existence.next({
				id: lastValue.id,
				lastValue,
				value: newValue,
				type: ExistenceEventType.Updated
			});
		});

		this.log.info(
			{
				callId,
				findObj,
				updateObj,
				lastValues,
				updatedObjects
			},
			'.updateMultiple(objectId, updateObj) updated objects'
		);

		return updatedObjects as T[];
	}
	async updateMultipleByIds(ids: string[], updateObj: any): Promise<T[]> {
		const promises = ids.map((id) => this.update(id, updateObj));
		return Promise.all(promises);
	}
	count(conditions: any): Promise<number> {
		return this._repository.count(conditions);
	}

	public set repository(repo: Repository<T>) {
		this._repository = repo;
	}
}

export const typeORMServiceFactory = (context: interfaces.Context) => {
	return <T extends DBObject<any, any>>(repository: Repository<T>) => {
		const service = context.container.get<TypeORMService<T>>(
			TypeORMService
		);
		service.repository = repository;
		return service;
	};
};
