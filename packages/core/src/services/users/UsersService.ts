import Logger from 'bunyan';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import { env } from '../../env';
import User from '@modules/server.common/entities/User';
import { createEverLogger } from '../../helpers/Log';
import { InvitesService } from '../invites';
import { DBService } from '@pyro/db-server';
import {
	IUserCreateObject,
	IUserInitializeObject,
} from '@modules/server.common/interfaces/IUser';
import IUserRouter from '@modules/server.common/routers/IUserRouter';
import {
	asyncListener,
	observableListener,
	routerName,
	serialization,
} from '@pyro/io';
import { Observable } from 'rxjs';
import { observeFile } from '../../utils';
import GeoLocation, {
	Country,
} from '@modules/server.common/entities/GeoLocation';
import IGeoLocation, {
	IGeoLocationCreateObject,
} from '@modules/server.common/interfaces/IGeoLocation';
import { DevicesService } from '../devices';
import IService from '../IService';
import { v1 as uuid } from 'uuid';
import {
	distinctUntilChanged,
	exhaustMap,
	first,
	publishReplay,
	refCount,
	switchMap,
	tap,
	map,
} from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import _ = require('lodash');
import faker from 'faker';
import { WarehousesService } from '../../services/warehouses';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';
import Stripe = require('stripe');

interface IWatchedFiles {
	aboutUs: { [language in ILanguage]: Observable<string> };
	privacy: { [language in ILanguage]: Observable<string> };
	termsOfUse: { [language in ILanguage]: Observable<string> };
}

/**
 * Customers Service
 * TODO: rename from UsersService to CustomersService
 *
 * @export
 * @class UsersService
 * @extends {DBService<User>}
 * @implements {IUserRouter}
 * @implements {IService}
 */
@injectable()
@routerName('user')
export class UsersService extends DBService<User>
	implements IUserRouter, IService {
	public readonly DBObject: any = User;

	// TODO: this and other Stripe related things should be inside separate Payments Service
	private stripe = new Stripe(env.STRIPE_SECRET_KEY);

	protected readonly log: Logger = createEverLogger({
		name: 'usersService',
	});

	public watchedFiles: IWatchedFiles;

	constructor(
		@inject(new LazyServiceIdentifer(() => InvitesService))
		protected invitesService: InvitesService,
		@inject(new LazyServiceIdentifer(() => DevicesService))
		protected devicesService: DevicesService,
		@inject(new LazyServiceIdentifer(() => WarehousesService))
		protected _storesService: WarehousesService
	) {
		super();

		// TODO: too many hardcoded constants used below. Refactor!
		this.watchedFiles = _.zipObject(
			['aboutUs', 'privacy', 'termsOfUse'],
			_.map(['about_us', 'privacy', 'terms_of_use'], (folder) =>
				_.zipObject(
					['en-US', 'he-IL', 'ru-RU', 'bg-BG'],
					_.map(['en-US', 'he-IL', 'ru-RU', 'bg-BG'], (language) =>
						observeFile(
							`${__dirname}/../../../res/templates/${folder}/${language}.hbs`
						).pipe(
							tap({ error: (err) => this.log.error(err) }),
							publishReplay(1),
							refCount<string>()
						)
					)
				)
			)
		) as any;
	}

	/**
	 * Verify if customer with given email already exists
	 *
	 * @param {string} email
	 * @returns {Promise<boolean>}
	 * @memberof UsersService
	 */
	async isUserEmailExists(email: string): Promise<boolean> {
		return (await this.count({ email })) > 0;
	}

	/**
	 * Get Customer by given social Id
	 *
	 * @param {string} socialId
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	async getSocial(socialId: string): Promise<User> {
		return super.findOne({
			socialIds: { $in: [socialId] },
			isDeleted: { $eq: false },
		});
	}

	/**
	 * Create new customer (intialize record)
	 *
	 * @param {IUserInitializeObject} userInitializeObject
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	async initUser(userInitializeObject: IUserInitializeObject): Promise<User> {
		return super.create(userInitializeObject as any);
	}

	/**
	 * Get Customers
	 *
	 * @param {*} findInput
	 * @param {IPagingOptions} pagingOptions
	 * @returns
	 * @memberof UsersService
	 */
	async getUsers(findInput: any, pagingOptions: IPagingOptions) {
		const sortObj = {};
		if (pagingOptions.sort) {
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}

		return this.Model.find({
			...findInput,
			isDeleted: { $eq: false },
		})
			.sort(sortObj)
			.skip(pagingOptions.skip)
			.limit(pagingOptions.limit)
			.lean()
			.exec();
	}

	/**
	 * Updates Customer details
	 * // TODO function actually returns User | null we should fix that.
	 *
	 * @param {string} id
	 * @param {IUserCreateObject} userCreateObject
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async updateUser(
		id: string,
		userCreateObject: IUserCreateObject
	): Promise<User> {
		await this.throwIfNotExists(id);
		return super.update(id, userCreateObject);
	}

	/**
	 * Get Customer by Id
	 *
	 * @param {string} customerId
	 * @returns {Observable<User>}
	 * @memberof UsersService
	 */
	@observableListener()
	get(customerId: string): Observable<User> {
		return super.get(customerId).pipe(
			map(async (user) => {
				await this.throwIfNotExists(customerId);
				return user;
			}),
			switchMap((user) => user)
		);
	}

	/**
	 * Get Stripe Cards for given customer
	 * TODO: move to separate Stripe (Payments) Service
	 *
	 * @param {string} userId
	 * @returns {Promise<Stripe.cards.ICard[]>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async getCards(userId: string): Promise<Stripe.cards.ICard[]> {
		await this.throwIfNotExists(userId);

		const user = await this.get(userId).pipe(first()).toPromise();

		if (user != null) {
			if (user.stripeCustomerId != null) {
				return (
					await this.stripe.customers.listSources(
						user.stripeCustomerId,
						{
							object: 'card',
						}
					)
				).data;
			} else {
				return [];
			}
		} else {
			throw new Error(`User with the id ${userId} doesn't exist`);
		}
	}

	/**
	 * Add Payment Method (Credit Card) for the customer.
	 * If method called first time for given customer, it creates Customer record in the Stripe API and
	 * updates stripeCustomerId in our DB
	 *
	 * TODO: move to separate Stripe (Payments) Service
	 *
	 * @param {string} userId
	 * @param {string} tokenId
	 * @returns {Promise<string>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async addPaymentMethod(userId: string, tokenId: string): Promise<string> {
		await this.throwIfNotExists(userId);

		const callId = uuid();

		this.log.info(
			{ callId, userId, tokenId },
			'.addPaymentMethod(userId, tokenId) called'
		);

		let card: Stripe.cards.ICard;

		try {
			let user = await this.get(userId).pipe(first()).toPromise();

			if (user != null) {
				if (user.stripeCustomerId == null) {
					const customer = await this.stripe.customers.create({
						email: user.email,
						description: 'User id: ' + user.id,
						metadata: {
							userId: user.id,
						},
					});

					user = await this.update(userId, {
						stripeCustomerId: customer.id,
					});
				}

				card = (await this.stripe.customers.createSource(
					user.stripeCustomerId as string,
					{
						source: tokenId,
					}
				)) as Stripe.cards.ICard;
			} else {
				throw new Error(`User with the id ${userId} doesn't exist`);
			}
		} catch (err) {
			this.log.error(
				{ callId, userId, tokenId, err },
				'.addPaymentMethod(userId, tokenId) thrown error!'
			);
			throw err;
		}

		this.log.info(
			{ callId, userId, tokenId, card },
			'.addPaymentMethod(userId, tokenId) added payment method'
		);

		return card.id;
	}

	/**
	 * Update email for given Customer (by customer Id)
	 *
	 * @param {string} userId
	 * @param {string} email
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async updateEmail(userId: string, email: string): Promise<User> {
		await this.throwIfNotExists(userId);
		return this.update(userId, { email });
	}

	/**
	 * Update current location (address) for given Customer
	 *
	 * @param {string} userId
	 * @param {GeoLocation} geoLocation
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async updateGeoLocation(
		userId: string,
		@serialization((g: IGeoLocation) => new GeoLocation(g))
		geoLocation: GeoLocation
	): Promise<User> {
		await this.throwIfNotExists(userId);
		return this.update(userId, { geoLocation });
	}

	/**
	 * Get About Us Content (HTML)
	 * Note: Depending on user country, language and other settings, we may want later to show different About Us page
	 * (e.g. show different contact details or branch location etc)
	 * @param userId
	 * @param deviceId
	 * @returns HTML representation of About Us
	 */
	@observableListener()
	getAboutUs(
		userId: string,
		deviceId: string
	): Observable<string> /*returns html*/ {
		return this.devicesService.get(deviceId).pipe(
			exhaustMap((device) => {
				if (device === null) {
					return _throw(
						new Error(`User with the id ${userId} doesn't exist`)
					);
				} else {
					return of(device);
				}
			}),
			distinctUntilChanged(
				(oldDevice, newDevice) =>
					oldDevice.language !== newDevice.language
			),
			switchMap((device) => this.watchedFiles.aboutUs[device.language])
		);
	}

	/**
	 * Get Terms Of Use Content (HTML)
	 * Note: Depending on user country, language and other settings, we may want later to show different Terms
	 * @param userId
	 * @param deviceId
	 * @returns HTML representation of Terms Of Use
	 */
	@observableListener()
	getTermsOfUse(userId: string, deviceId: string): Observable<string> {
		return this.devicesService.get(deviceId).pipe(
			exhaustMap((device) => {
				if (device === null) {
					return _throw(
						new Error(
							`Device with the id ${deviceId} doesn't exist`
						)
					);
				} else {
					return of(device);
				}
			}),
			distinctUntilChanged(
				(oldDevice, newDevice) =>
					oldDevice.language !== newDevice.language
			),
			switchMap((device) => this.watchedFiles.termsOfUse[device.language])
		);
	}

	/**
	 * Get Privacy Policy Content (HTML)
	 * Note: Depending on user country, language and other settings, we may want later to show different Policy
	 * @param userId
	 * @param deviceId
	 * @returns HTML representation of privacy policy
	 */
	@observableListener()
	getPrivacy(userId: string, deviceId: string): Observable<string> {
		return this.devicesService.get(deviceId).pipe(
			exhaustMap((device) => {
				if (device === null) {
					return _throw(
						new Error(`User with the id ${userId} doesn't exist`)
					);
				} else {
					return of(device);
				}
			}),
			distinctUntilChanged(
				(oldDevice, newDevice) =>
					oldDevice.language !== newDevice.language
			),
			switchMap((device) => this.watchedFiles.privacy[device.language])
		);
	}

	/**
	 * Generates Fake Customer records
	 * TODO: move to separate FakeUsersService (put into 'fake-data' folder)
	 * TODO: rename method to "generateCustomers"
	 *
	 * @param {number} defaultLng
	 * @param {number} defaultLat
	 * @returns {Promise<IUserCreateObject[]>}
	 * @memberof UsersService
	 */
	async generate1000Customers(
		defaultLng: number,
		defaultLat: number
	): Promise<IUserCreateObject[]> {
		const existingEmails = _.map(
			await this.Model.find({}).select({ email: 1 }).lean().exec(),
			(u) => u.email
		);

		const customersToCreate: IUserCreateObject[] = [];

		const customerCreatedFrom = new Date(2015, 1);
		const customerCreatedTo = new Date();

		let customerCount = 1;

		while (customerCount <= 1000) {
			const firstName = faker.name.firstName();
			const lastName = faker.name.lastName();
			const email = faker.internet.email(firstName, lastName);
			const isBanned = Math.random() < 0.02;

			const geoLocation: IGeoLocationCreateObject = {
				countryId: faker.random.number(Country.ZW) as Country,
				city: faker.address.city(),
				house: `${customerCount}`,
				loc: {
					type: 'Point',
					coordinates: [defaultLng, defaultLat],
				},
				streetAddress: faker.address.streetAddress(),
			};

			if (!existingEmails.includes(email)) {
				existingEmails.push(email);

				customersToCreate.push({
					firstName: faker.name.firstName(),
					lastName: faker.name.lastName(),
					geoLocation,
					apartment: `${customerCount}`,
					email,
					isBanned,
					image: faker.image.avatar(),
					phone: faker.phone.phoneNumber(),
					_createdAt: faker.date.between(
						customerCreatedFrom,
						customerCreatedTo
					),
				} as any);

				customerCount += 1;
			}
		}

		return this.Model.insertMany(customersToCreate);
	}

	async banUser(id: string): Promise<User> {
		await this.throwIfNotExists(id);
		return this.update(id, { isBanned: true });
	}

	async unbanUser(id: string): Promise<User> {
		await this.throwIfNotExists(id);
		return this.update(id, { isBanned: false });
	}

	/**
	 * Check if not deleted customer with given Id exists in DB and throw exception if it's not exists or deleted
	 *
	 * @param {string} userId
	 * @memberof UsersService
	 */
	async throwIfNotExists(userId: string) {
		const user = await super.get(userId).pipe(first()).toPromise();

		if (!user || user.isDeleted) {
			throw Error(`Customer with id '${userId}' does not exists!`);
		}
	}
}
