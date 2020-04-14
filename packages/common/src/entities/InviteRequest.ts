import { DBObject, Schema, ModelName, Types, getSchema } from '../@pyro/db';
import {
	IInviteRequestCreateObject,
	IInviteRequestRawObject,
} from '../interfaces/IInviteRequest';
import { default as GeoLocation } from './GeoLocation';
import IEnterByLocation from '../interfaces/IEnterByLocation';
import { Entity, Column } from 'typeorm';

/**
 * Requests for invite from potential Customers
 * Customers ask to be invited (optionally, if invites system enabled) for given location (address).
 * Later, Store owner decide if he wants to approve invite request (by generating invite record).
 *
 * @class InviteRequest
 * @extends {DBObject<IInviteRequestRawObject, IInviteRequestCreateObject>}
 * @implements {IInviteRequestRawObject}
 */
@ModelName('InviteRequest')
@Entity({ name: 'inviterequests' })
class InviteRequest
	extends DBObject<IInviteRequestRawObject, IInviteRequestCreateObject>
	implements IInviteRequestRawObject {
	constructor(inviteRequest: IInviteRequestRawObject) {
		super(inviteRequest);

		if (inviteRequest && inviteRequest.geoLocation) {
			this.geoLocation = new GeoLocation(inviteRequest.geoLocation);
		}
	}

	/**
	 * Current location (address) of person who request invite
	 *
	 * @type {GeoLocation}
	 * @memberof InviteRequest
	 */
	@Schema(getSchema(GeoLocation))
	geoLocation: GeoLocation;

	/**
	 * ID of potential customer device
	 * Note: used to send push notification to customer when store owner decide to invite her/him
	 *
	 * @type {string}
	 * @memberof InviteRequest
	 */
	@Schema({ required: false, type: String })
	@Column()
	deviceId?: string;

	/**
	 * Apartment of potential Customer (optionally)
	 *
	 * @type {string}
	 * @memberof InviteRequest
	 */
	@Types.String()
	@Column()
	apartment: string;

	@Schema({ required: false, type: Boolean, default: false })
	@Column()
	isManual?: boolean;

	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;

	/**
	 * If this require invite approved, isInvited field set to true
	 *
	 * @type {boolean}
	 * @memberof InviteRequest
	 */
	@Types.Boolean(false)
	@Column()
	isInvited: boolean;

	/**
	 * The date when invite was sent to the potential customer
	 *
	 * @type {Date}
	 * @memberof InviteRequest
	 */
	@Schema({ type: Date, required: false })
	@Column()
	invitedDate: Date;

	toAddressString(): string | null {
		if (!this.geoLocation) {
			return null;
		}

		let address = `${this.geoLocation.streetAddress} ${this.geoLocation.house}`;

		if (this.apartment) {
			address += `/${this.apartment}`;
		}

		address += `, ${this.geoLocation.city}`;

		return address;
	}

	toEnterByLocationToken(): IEnterByLocation {
		if (
			this.geoLocation.house != null &&
			this.geoLocation.streetAddress != null &&
			this.geoLocation.city != null &&
			this.geoLocation.countryId != null
		) {
			return {
				apartment: this.apartment,
				house: this.geoLocation.house,
				streetAddress: this.geoLocation.streetAddress,
				city: this.geoLocation.city,
				postcode: this.geoLocation.postcode,
				countryId: this.geoLocation.countryId,
			};
		} else {
			throw new Error('GeoLocation is not full!');
		}
	}
}

export default InviteRequest;
