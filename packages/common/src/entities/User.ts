import GeoLocation from './GeoLocation';
import { DBObject, getSchema, ModelName, Schema, Types } from '../@pyro/db';
import IUser, { IUserCreateObject } from '../interfaces/IUser';
import { Entity, Column } from 'typeorm';

/**
 * Customer who make orders
 * TODO: historically called 'User', but we will rename to 'Customer'
 *
 * @class User
 * @extends {DBObject<IUser, IUserCreateObject>}
 * @implements {IUser}
 */
@ModelName('User')
@Entity({ name: 'users' })
class User extends DBObject<IUser, IUserCreateObject> implements IUser {
	constructor(user: IUser) {
		super(user);

		if (user && user.geoLocation) {
			this.geoLocation = new GeoLocation(user.geoLocation);
		}
	}

	/**
	 * First Name
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: false })
	@Column()
	firstName?: string;

	/**
	 * Last Name
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: false })
	@Column()
	lastName?: string;

	/**
	 * Customer Image (Photo/Avatar) URL
	 * (optional)
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: false })
	@Column()
	image: string;

	/**
	 * Primary Email Address
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema({
		type: String,
		required: false,
		sparse: true,
		unique: true,
	})
	@Column()
	email?: string;

	/**
	 * Password hash
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({
		type: String,
		required: false,
		select: false,
	})
	@Column()
	hash?: string;

	/**
	 * Current customer location (customer address, last known location of the customer)
	 *
	 * @type {GeoLocation}
	 * @memberof User
	 */
	@Schema(getSchema(GeoLocation))
	geoLocation: GeoLocation;

	/**
	 * Apartment (stored separately from geolocation/address for efficiency)
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema(String)
	@Column()
	apartment: string;

	/**
	 * CustomerId in the Stripe payment gateway (if customer added to Stripe, optional)
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: false })
	@Column()
	stripeCustomerId?: string;

	/**
	 * IDs of customer mobile devices / browser (see Device entity)
	 *
	 * @type {string[]}
	 * @memberof User
	 */
	@Schema([String])
	devicesIds: string[];

	/**
	 * IDs of customer in social networks / OAuth providers
	 *
	 * @type {string[]}
	 * @memberof User
	 */
	@Schema([String])
	socialIds: string[];

	/**
	 * Customer Primary Phone Number
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema(String)
	@Column()
	phone?: string;

	/**
	 * Is customer completed registration
	 *
	 * @type {boolean}
	 * @memberof User
	 */
	@Schema(Boolean)
	@Column()
	isRegistrationCompleted: boolean;

	/**
	 * Is customer banned
	 *
	 * @type {boolean}
	 * @memberof User
	 */
	@Types.Boolean(false)
	@Column()
	isBanned: boolean;

	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;

	/**
	 * Get full address of customer (including apartment)
	 * Note: does not include country
	 *
	 * @readonly
	 * @memberof User
	 */
	get fullAddress(): string {
		return (
			`${this.geoLocation.city}, ${this.geoLocation.streetAddress} ` +
			`${this.apartment}/${this.geoLocation.house}`
		);
	}
}

export default User;
