/*import { expect } from 'chai';
import { servicesContainer } from '../../../services/inversify.config';
import { InvitesService } from '../../../services/invites';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import { env } from '../../../env';

describe('InvitesService', () => {

	let connection;
	let db;

	beforeEach(async () => {
		connection = await MongoClient.connect(global[ '__MONGO_URI__' ]);
		db = await connection.db(global[ '__MONGO_DB_NAME__' ]);

		mongoose.connect(env.TESTING_DB_URI, {
			autoReconnect: true,
			reconnectTries: Number.MAX_VALUE,
			poolSize: 50,
			connectTimeoutMS: 10000
		} as any, (err) => {
			if (err != null) {
				this.log.error(err);
			}
		});

		servicesContainer.snapshot();
	});

	afterEach(() => {
		servicesContainer.restore();
	});

	afterAll(async () => {
		await connection.close();
		await db.close();
	});

	describe('.findOne(conditions)', () => {
		it('should find fakeData', async () => {

			const invitesService: InvitesService = servicesContainer.get<InvitesService>(InvitesService);

			await invitesService.create({
				geoLocation: {
					city: 'אשדוד',
					postcode: '77452',
					streetAddress: 'העצמאות',
					house: '38',
					countryId: 1,
					loc: {
						type: 'Point',
						coordinates: [
							31.7580976,
							34.6359946
						]
					}
				},
				apartment: '3',
				code: '2446'
			});

			const invite = await invitesService.findOne({
				'geoLocation.city': 'אשדוד',
				'geoLocation.streetAddress': 'העצמאות',
				'geoLocation.house': '38',
				'geoLocation.countryId': 1,
				'apartment': '3'
			});

			expect(invite).to.not.be.null;
		});
	});

});
*/
