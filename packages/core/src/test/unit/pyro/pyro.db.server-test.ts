/*import { assert, expect } from 'chai';
import { servicesContainer } from '../../../services/inversify.config';
import { DBService, getModel, IDBService } from '@pyro/db-server';
import { DBCreateObject, DBObject, DBRawObject, PyroObjectId, Schema, Types } from '@pyro/db';
import Logger from 'bunyan';
import mongoose from 'mongoose';
import _ from 'lodash';
import { loggerMock } from '../../loggerMock';
import { take, toArray } from 'rxjs/operators';

interface CreateObjectMock extends DBCreateObject {
	stringField: string;
	numberField?: number;
	booleanField?: boolean;
}

interface RawObjectMock extends CreateObjectMock, DBRawObject {
	_id: PyroObjectId;

	numberField: number;
}

class DBObjectMock extends DBObject<RawObjectMock, CreateObjectMock> implements RawObjectMock {
	@Types.String() stringField: string;
	@Types.Number(5) numberField: number;
	@Schema({ required: false, type: Boolean }) booleanField?: boolean;
}

class DBServiceMock extends DBService<CreateObjectMock, RawObjectMock, DBObjectMock> {
	protected log: Logger = loggerMock;

	get DBObject() {
		return DBObjectMock;
	}
}

type IDBServiceMock = IDBService<CreateObjectMock, DBObjectMock>;

const createObjectMock: CreateObjectMock = {
	stringField: 'hello',
	numberField: 100,
	booleanField: false
};

describe('DBService', () => {

	beforeEach(() => {
		servicesContainer.snapshot();
		servicesContainer.bind<IDBServiceMock>('IDBServiceMock').to(DBServiceMock);
	});

	afterEach(() => {
		servicesContainer.restore();
	});

	const Model = getModel<RawObjectMock & mongoose.Document>(DBObjectMock);

	describe('.create(createObject)', () => {

		it('creates object', async () => {
			const dbService = servicesContainer.get<IDBServiceMock>('IDBServiceMock');

			await dbService.create(createObjectMock);
			const objs: RawObjectMock[] = await Model.find(createObjectMock).exec();

			expect(_.some(objs, createObjectMock)).to.equal(true);

			servicesContainer.bind<IDBServiceMock>(Model);

		});
	});

	describe('.remove(id)', () => {

		it('removes object by id', async () => {
			const dbService = servicesContainer.get<IDBServiceMock>('IDBServiceMock');

			const id = (await Model.create(createObjectMock))._id.toString();
			dbService.remove(id);

			const objs: RawObjectMock[] = await Model.find(createObjectMock).exec();
			expect(objs).to.be.empty;
		});
	});

	describe('.removeAll()', () => {
		it('removes all the objects', async () => {
			const dbService = servicesContainer.get<IDBServiceMock>('IDBServiceMock');

			await Model.create(createObjectMock);
			await Model.create(createObjectMock);

			dbService.removeAll();

			const objs: RawObjectMock[] = await Model.find(createObjectMock).exec();
			expect(objs).to.be.empty;
		});
	});

	describe('.get(id)', () => {
		it('watches changes', async () => {
			const dbService = servicesContainer.get<IDBServiceMock>('IDBServiceMock');

			const _id = new mongoose.Types.ObjectId();
			const id = _id.toString();

			const changesPromise = dbService.get(id).pipe(take(4), toArray()).toPromise();

			await dbService.create({
				...createObjectMock,
				_id: _id
			});

			let updateObject = {
				stringField: 'new value'
			};

			await dbService.update(id, updateObject);

			await dbService.remove(id);

			const changes: (DBObjectMock | null)[] = await changesPromise;

			assert.isNull(changes[ 0 ]);

			assert.isNotNull(changes[ 1 ]);
			assert.isTrue(
				_.some([ changes[ 1 ] ], createObjectMock)
			);

			assert.isNotNull(changes[ 2 ]);
			assert.isTrue(
				_.some([ changes[ 2 ] ], {
					...createObjectMock,
					...updateObject
				})
			);

			assert.isNull(changes[ 3 ]);

		});
	});

	describe('.find(conditions)', () => {
		it('finds single object', async () => {

			const dbService = servicesContainer.get<IDBServiceMock>('IDBServiceMock');

			await Model.create(createObjectMock);

			let objs = await dbService.find(createObjectMock);
			assert.isTrue(objs.length == 1);
			assert.isTrue(
				_.some(objs, createObjectMock)
			);

		});

		it('finds multiple objects', async () => {

			const dbService = servicesContainer.get<IDBServiceMock>('IDBServiceMock');

			await Model.create(createObjectMock);

			const anotherCreateObjectMock = {
				...createObjectMock,
				stringField: 'different value'
			};

			await Model.create(anotherCreateObjectMock);

			let { stringField, ...findObject } = createObjectMock;
			let objs = await dbService.find(findObject);

			assert.lengthOf(objs, 2);
			assert.isTrue(_.some(objs, createObjectMock));
			assert.isTrue(_.some(objs, anotherCreateObjectMock));

		});
	});

});
*/
