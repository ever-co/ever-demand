// import mongoose from 'mongoose';
// import { env } from '../env';
// // import MongodbMemoryServer from 'mongodb-memory-server';
//
// process.env.NODE_ENV = 'test';
//
// jest.setTimeout(30000);
//
// export namespace testing {
//
// 	export let mongod;
//
// 	export async function ensureConnected() {
//
// 		/*mongod = new MongodbMemoryServer({
// 			instance: {
// 				dbName: 'jest'
// 			},
// 			debug: true
// 		});
//
// 		const mongoUrl = await mongod.getConnectionString();*/
//
// 		const mongoUrl = env.TESTING_DB_URI;
//
// 		(mongoose as any).Promise = Promise;
//
// 		const options = {
// 			auto_reconnect: true,
// 			reconnectTries: Number.MAX_VALUE,
// 			reconnectInterval: 1000
// 		};
//
// 		await mongoose.connect(mongoUrl, options);
// 		console.log(`MongoDB successfully connected to ${mongoUrl}`);
// 	}
//
// 	export async function clearDb() {
// 		for (const collection of Object.values(mongoose.connection.collections)) {
// 			await collection.drop();
// 		}
// 		// connection.db.dropDatabase(done);
// 	}
//
// 	export async function disconnect() {
// 		if (mongoose.connection) {
// 			await mongoose.disconnect();
// 			await mongod.stop();
// 		}
// 	}
//
// }
