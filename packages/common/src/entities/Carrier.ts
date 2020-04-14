import CarrierStatus from '../enums/CarrierStatus';
import GeoLocation from './GeoLocation';
import { DBObject, getSchema, ModelName, Schema, Types } from '../@pyro/db';
import ICarrier, { ICarrierCreateObject } from '../interfaces/ICarrier';
import { Entity, Column } from 'typeorm';

/**
 * Carriers (Drivers, people or organizations which deliver products to customers)
 *
 * @class Carrier
 * @extends {DBObject<ICarrier, ICarrierCreateObject>}
 * @implements {ICarrier}
 */
@ModelName('Carrier')
@Entity({ name: 'carriers' })
class Carrier extends DBObject<ICarrier, ICarrierCreateObject>
	implements ICarrier {
	constructor(carrier: ICarrier) {
		super(carrier);

		if (carrier && carrier.geoLocation) {
			this.geoLocation = new GeoLocation(carrier.geoLocation);
		}
	}

	/**
	 * First Name (required)
	 *
	 * @type {string}
	 * @memberof Carrier
	 */
	@Schema({
		type: String,
		required: true,
		validate: new RegExp(`^[a-z ,.'-]+$`, 'i'),
	})
	@Column()
	firstName: string;

	/**
	 * Last Name (required)
	 *
	 * @type {string}
	 * @memberof Carrier
	 */
	@Schema({
		type: String,
		required: true,
		validate: new RegExp(`^[a-z ,.'-]+$`, 'i'),
	})
	@Column()
	lastName: string;

	/**
	 * How many deliveries totally this carrier made
	 *
	 * @type {number}
	 * @memberof Carrier
	 */
	@Types.Number(0)
	@Column()
	numberOfDeliveries: number;

	/**
	 * Current location of the Carrier (updated periodically during carrier movements)
	 *
	 * @type {GeoLocation}
	 * @memberof Carrier
	 */
	@Schema(getSchema(GeoLocation))
	geoLocation: GeoLocation;

	/**
	 * Current Apartment (if carrier located in some appartment at the moment)
	 *
	 * @type {string}
	 * @memberof Carrier
	 */
	@Schema(String)
	@Column()
	apartment?: string;

	/**
	 * Is Carrier Active at the moment in the system
	 * Value 'True' means carrier enabled in system,
	 * Value 'False' means carrier completely disabled in the system (e.g. was fired)
	 * This setting is set by Admin,
	 * not by carrier itself (he/she set 'status' field instead in the carrier mobile app)
	 * @type {boolean}
	 * @memberof Carrier
	 */
	@Types.Boolean(true)
	@Column()
	isActive: boolean;

	/**
	 * Is Carrier removed completely from the system
	 *
	 * @type {boolean}
	 * @memberof Carrier
	 */
	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;

	/**
	 * Current carrier status (set via his mobile app), e.g. Online or Offline
	 *
	 * @type {CarrierStatus}
	 * @memberof Carrier
	 */
	@Types.Number(CarrierStatus.Offline)
	@Column()
	status: CarrierStatus;

	/**
	 * Unique Carrier username, which used for Authentication of the Carrier in the app
	 *
	 * @type {string}
	 * @memberof Carrier
	 */
	@Schema({ type: String, unique: true, required: true })
	@Column()
	username: string;

	/**
	 * Shows if carrier is shared or assigned to some store
	 *
	 * @type {boolean}
	 * @memberof Carrier
	 */
	@Schema({ type: Boolean, required: false })
	@Column()
	shared: boolean;

	/**
	 * Hashed password
	 *
	 * @type {string}
	 * @memberof Carrier
	 */
	@Schema({ type: String, required: false, select: false })
	@Column()
	hash?: string;

	/**
	 * Carrier Phone number (usually mobile phone)
	 *
	 * @type {string}
	 * @memberof Carrier
	 */
	@Types.String()
	@Column()
	phone: string;

	/**
	 * URL for Logo (brand image) or Avatar of the Carrier
	 *
	 * @type {string}
	 * @memberof Carrier
	 */
	@Schema({
		type: String,
		required: true,
		validate: new RegExp(
			`(http(s?):)s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))`
		),
	})
	@Column()
	logo: string;

	/**
	 * Carrier email (optional)
	 *
	 * @type {string}
	 * @memberof Carrier
	 */
	@Schema({
		type: String,
		required: false,
		sparse: true,
		unique: true,
	})
	@Column()
	email: string;

	@Schema([String])
	@Column()
	skippedOrderIds: string[];

	/**
	 * How many deliveries carrier made today
	 * TODO: implement calculation, useful for stats
	 *
	 * @type {number}
	 * @memberof Carrier
	 */
	@Types.Number(0)
	@Column()
	deliveriesCountToday: number;

	/**
	 * How much km (or miles) Carrier made today during deliveries
	 * TODO: implement calculation, useful for stats
	 * @type {number}
	 * @memberof Carrier
	 */
	@Types.Number(0)
	@Column()
	totalDistanceToday: number;

	/**
	 * IDs of Carrier devices (mobiles)
	 * Used to send Push Notifications to Carrier devices
	 *
	 *
	 * @type {string[]}
	 * @memberof Carrier
	 */
	@Schema([String])
	devicesIds: string[];

	/**
	 * Is shared the carrier, i.e if not then only merchant which already has such carrier assigned
	 * (inside "carriersIds" array on Merchant) can use such carrier and no one else
	 *
	 * @type {boolean}
	 * @memberof Carrier
	 */
	@Types.Boolean(false)
	@Column()
	isSharedCarrier: boolean;

	/**
	 * Full name of the Carrier
	 *
	 * @readonly
	 * @type {string}
	 * @memberof Carrier
	 * @returns full name of the carrier
	 */
	get fullName(): string {
		return `${this.firstName} ${this.lastName}`;
	}
}

export default Carrier;
