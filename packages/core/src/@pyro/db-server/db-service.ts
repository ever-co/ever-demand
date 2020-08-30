import mongoose from 'mongoose';
import _ from 'lodash';
import Logger from 'bunyan';
import { Observable, Subject } from 'rxjs';
import { injectable } from 'inversify';
import { ExistenceEvent, ExistenceEventType } from './existence';
import { from } from 'rxjs/observable/from';
import { concat, exhaustMap, filter, map, share, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { v1 as uuid } from 'uuid';
import { IDbService } from '@pyro/db-server/i-db-service';
import { DBObject } from '@pyro/db';
import { RawObject } from '@pyro/db/db-raw-object';
import { CreateObject } from '@pyro/db/db-create-object';
import { FindObject } from '@pyro/db/db-find-object';
import { UpdateObject } from '@pyro/db/db-update-object';
import { EntityService } from '@pyro/db-server/entity-service';

@injectable()
export abstract class DBService<T extends DBObject<any, any>>
	extends EntityService<T>
	implements IDbService<T> {
	public abstract readonly DBObject: {
		new (arg: RawObject<T>): T;
		modelName: string;
	};

	public readonly existence: Subject<ExistenceEvent<T>>;

	protected abstract readonly log: Logger;

	constructor() {
		super();
		this.existence = new Subject<ExistenceEvent<T>>();
	}

	get(id: T['id']): Observable<T | null> {
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
							callId,
						},
						'.get(id) emitted next value'
					);
				},
				error: (err) => {
					this.log.error(
						{
							objectId: id,
							err,
							callId,
						},
						'.get(id), emitted error!'
					);
				},
			})
		);
	}

	async getCurrent(id: T['id']): Promise<T | null> {
		const callId = uuid();

		this.log.info({ objectId: id, callId }, '.getCurrent(id) called');

		const obj = await this.Model.findById(id).lean().exec();

		return this.parse(obj as RawObject<T>);
	}

	getMultiple(ids: T['id'][]): Observable<T[]> {
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
				},
			})
		);
	}

	async getCurrentMultiple(ids: T['id'][]): Promise<T[]> {
		const callId = uuid();

		this.log.info(
			{ objectIds: ids, callId },
			'.getCurrentMultiple(ids) called'
		);

		const objs = await this.Model.find({
			_id: {
				$in: _.map(ids, (id) => this.getObjectId(id)),
			},
		})
			.lean()
			.exec();

		return _.map(objs as RawObject<T>[], (obj) => this.parse(obj));
	}

	async create(createObject: CreateObject<T>): Promise<T> {
		const callId = uuid();

		this.log.info({ callId, createObject }, '.create(createObject) called');

		let object;

		try {
			const document = await this.Model.create(createObject);

			object = this.parse(document.toObject() as RawObject<T>);
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
			type: ExistenceEventType.Created,
		});

		this.log.info(
			{ callId, createObject, object },
			'.create(createObject) created object'
		);

		return object;
	}

	/**
	 * Removes all records from the DB
	 * TODO: add Guards to avoid run on production
	 *
	 * @returns {Promise<void>}
	 * @memberof DBService
	 */
	async removeAll(): Promise<void> {
		const callId = uuid();

		this.log.info({ callId }, '.removeAll() called!');

		try {
			await this.Model.remove({}).exec();
		} catch (err) {
			this.log.error({ callId, err }, '.removeAll() thrown error!');
			throw err;
		}

		this.log.info({ callId }, '.removeAll() removed all!');
	}

	/**
	 * Removes record from the DB
	 * TODO: we should add another method which set IsDeteled = true and do not delete record from DB in most cases
	 *
	 * @param {T['id']} objectId
	 * @returns {Promise<void>}
	 * @memberof DBService
	 */
	async remove(objectId: T['id']): Promise<void> {
		const callId = uuid();

		this.log.info({ callId, objectId }, '.remove(objectId) called');

		let lastValue: T | null;

		try {
			const lastValueRaw = (await this.Model.findByIdAndRemove(objectId)
				.lean()
				.exec()) as RawObject<T>;

			lastValue = this.parse(lastValueRaw);
		} catch (err) {
			this.log.error(
				{ callId, objectId, err },
				'.remove(objectId) thrown error!'
			);

			throw err;
		}

		if (lastValue == null) {
			throw new Error(".remove(objectId) error - Object don't exist");
		} else {
			this.existence.next({
				id: objectId,
				value: null,
				lastValue,
				type: ExistenceEventType.Removed,
			});

			this.log.info(
				{ callId, objectId, lastValue },
				'.remove(objectId) removed object'
			);
		}
	}

	/**
	 * Remove multiple records from DB (efficient way)
	 *
	 * @param {FindObject<T>} conditions
	 * @returns {Promise<void>}
	 * @memberof DBService
	 */
	async removeMultiple(conditions: FindObject<T>): Promise<void> {
		const callId = uuid();

		this.log.info(
			{ callId, conditions },
			'.removeMultiple(conditions) called'
		);

		let lastValues: T[];

		try {
			lastValues = await this.find(conditions);

			await this.Model.deleteMany({
				_id: { $in: lastValues.map((o) => this.getObjectId(o.id)) },
			}).exec();
		} catch (err) {
			this.log.error(
				{ callId, conditions, err },
				'.removeMultiple(conditions) thrown error!'
			);
			throw err;
		}

		_.each(lastValues, (lastValue) => {
			this.existence.next({
				id: lastValue.id,
				lastValue,
				value: null,
				type: ExistenceEventType.Removed,
			});
		});

		this.log.info(
			{
				callId,
				conditions,
				lastValues,
			},
			'.removeMultiple(conditions) removed objects'
		);
	}

	/**
	 * Remove multiple records by Ids
	 *
	 * @param {Array<T['id']>} ids
	 * @returns {Promise<void>}
	 * @memberof DBService
	 */
	async removeMultipleByIds(ids: T['id'][]): Promise<void> {
		this.Model.update(
			{
				_id: { $in: ids.map((id) => this.getObjectId(id)) },
			},
			{ isDeleted: true },
			{ multi: true }
		).exec();
	}

	async find(conditions: FindObject<RawObject<T>>): Promise<T[]> {
		const callId = uuid();

		this.log.info({ callId, conditions }, '.find(conditions) called');

		let results: T[];

		try {
			const documents = (await this.Model.find(
				conditions == null ? {} : conditions
			)
				.lean()
				.exec()) as RawObject<T>[];

			results = _.map(documents, (obj) => this.parse(obj));
		} catch (err) {
			this.log.error(
				{ callId, conditions, err },
				'.find(conditions) thrown error!'
			);
			throw err;
		}

		this.log.info(
			{ callId, conditions, results },
			'.find(conditions) found results'
		);

		return results;
	}

	async findOne(conditions: FindObject<RawObject<T>>): Promise<T> {
		const callId = uuid();

		this.log.info({ callId, conditions }, '.findOne(conditions) called');

		let result: T;

		try {
			const obj = (await this.Model.findOne(conditions)
				.lean()
				.exec()) as RawObject<T>;

			result = this.parse(obj);
		} catch (err) {
			this.log.error(
				{ callId, conditions, err },
				'.findOne(conditions) thrown error!'
			);
			throw err;
		}

		this.log.info(
			{ callId, conditions, result },
			'.findOne(conditions) found result'
		);

		return result;
	}

	async update(objectId: T['id'], updateObj: UpdateObject<T>): Promise<T> {
		const callId = uuid();
		this.log.info(
			{ callId, objectId, updateObj },
			'.update(objectId, updateObj) called'
		);

		let beforeUpdateObject: T | null;

		let updatedObject: T;

		try {
			beforeUpdateObject = await this.getCurrent(objectId);

			if (beforeUpdateObject != null) {
				const obj = (await this.Model.findByIdAndUpdate(
					objectId,
					updateObj as any,
					{ new: true }
				)
					.lean()
					.exec()) as RawObject<T>;

				updatedObject = this.parse(obj);
			} else {
				throw new Error(
					`There is no such object with the id ${beforeUpdateObject}`
				);
			}
		} catch (err) {
			this.log.error(
				{ callId, objectId, updateObj, err },
				'.update(objectId, updateObj) thrown error!'
			);
			throw err;
		}

		this.existence.next({
			id: objectId,
			value: updatedObject,
			lastValue: beforeUpdateObject,
			type: ExistenceEventType.Updated,
		});

		this.log.info(
			{
				callId,
				objectId,
				updateObj,
				updatedValue: updatedObject,
				lastValue: beforeUpdateObject,
			},
			'.update(objectId, updateObj) updated object'
		);

		return updatedObject;
	}

	async updateMultiple(
		findObj: FindObject<T>,
		updateObj: UpdateObject<T>
	): Promise<T[]> {
		const callId = uuid();
		this.log.info(
			{ callId, findObj, updateObj },
			'.updateMultiple(findObj, updateObj) called'
		);

		let lastValues: T[];
		let updatedObjects: T[];

		try {
			lastValues = await this.find(findObj);

			await this.Model.updateMany(findObj, updateObj, {
				new: true,
			}).exec();

			updatedObjects = await this.getCurrentMultiple(
				_.map(lastValues, (value) => value.id)
			);
		} catch (err) {
			this.log.error(
				{ callId, findObj, updateObj, err },
				'.updateMultiple(findObj, updateObj) thrown error!'
			);
			throw err;
		}

		_.each(lastValues, (lastValue) => {
			const newValue = _.find(
				updatedObjects,
				(obj) => obj.id === lastValue.id
			) as T;

			this.existence.next({
				id: lastValue.id,
				lastValue,
				value: newValue,
				type: ExistenceEventType.Updated,
			});
		});

		this.log.info(
			{
				callId,
				findObj,
				updateObj,
				lastValues,
				updatedObjects,
			},
			'.updateMultiple(objectId, updateObj) updated objects'
		);

		return updatedObjects;
	}

	async updateMultipleByIds(
		ids: T['id'][],
		updateObj: UpdateObject<T>
	): Promise<T[]> {
		const callId = uuid();

		this.log.info(
			{ callId, ids, updateObj },
			'.updateMultipleByIds(ids, updateObj) called'
		);

		let updatedObjects: T[];

		try {
			updatedObjects = await this.updateMultiple(
				{
					// TODO: rewrite below
					// tslint:disable-next-line:no-object-literal-type-assertion
					_id: {
						$in: _.map(
							ids,
							(id) => new mongoose.Types.ObjectId(id)
						),
					} as FindObject<T>,
				},
				updateObj
			);
		} catch (err) {
			this.log.error(
				{ callId, ids, updateObj, err },
				'.updateMultipleByIds(ids, updateObj) thrown error!'
			);
			throw err;
		}

		this.log.info(
			{
				callId,
				ids,
				updateObj,
				updatedObjects,
			},
			'.updateMultipleByIds(ids, updateObj) updated objects'
		);

		return updatedObjects;
	}

	async count(findObj: FindObject<T>): Promise<number> {
		const callId = uuid();

		this.log.info({ callId, findObj }, '.countDocuments(findObj) called');

		let count: number;

		try {
			count = (await this.Model.countDocuments(findObj).exec()) as number;
		} catch (err) {
			this.log.error(
				{ callId, findObj, err },
				'.countDocuments(findObj) thrown error!'
			);
			throw err;
		}

		this.log.info(
			{ callId, findObj, count },
			'.countDocuments(findObj) counted objects'
		);

		return count;
	}

	/**
	 * Return all store documents with specified fields
	 * @param selectFields Example { field: 1 } = true, { field: 0 } = false.
	 */
	async findAll(selectFields: any = {}) {
		return this.Model.find({}).select(selectFields).lean().exec();
	}
}
