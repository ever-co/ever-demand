import { DBObject, ModelName, TenantId } from '../@pyro/db';
import IAdmin, { IAdminCreateObject } from '../interfaces/IAdmin';
import { Schema, Types } from '@pyro/db';
import { Entity, Column } from 'typeorm';
import { TenantRole } from '../interfaces/ITenant';

/**
 * Registered Admin Users (e.g. Administrators)
 * TODO: will be renamed to "Users" (after we rename "Users" to "Customers")
 * Note: not related to Customers!
 *
 * @class Admin
 * @extends {DBObject<IAdmin, IAdminCreateObject>}
 * @implements {IAdmin}
 */
@ModelName('Admin')
@Entity({ name: 'admins' })
class Admin extends DBObject<IAdmin, IAdminCreateObject> implements IAdmin {
	/**
	 * The tenant (business) that owns this record. Set by the API from the
	 * tenant context; never taken from a client.
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@TenantId()
	tenantId: string;

	/**
	 * User Email
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Schema({ type: String, unique: true })
	@Types.String()
	@Column()
	email: string;

	/**
	 * Username
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Types.String()
	@Column()
	name: string;

	/**
	 * Password hash
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Schema({ type: String, select: false })
	@Types.String()
	@Column()
	hash: string;

	/**
	 * User Picture (Avatar) Url
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Types.String()
	@Column()
	pictureUrl: string;

	/**
	 * Is User Removed (Deleted)
	 *
	 * @type {boolean}
	 * @memberof Admin
	 */
	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;

	/**
	 * User First Name
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Schema({
		type: String,
		required: false,
		validate: new RegExp(`^[a-z ,.'-]+$`, 'i'),
	})
	@Column()
	firstName?: string;

	/**
	 * User Last Name
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Schema({
		type: String,
		required: false,
		validate: new RegExp(`^[a-z ,.'-]+$`, 'i'),
	})
	@Column()
	lastName?: string;

	/**
	 * Role inside the tenant: owner (one per tenant, also billing), admin or staff
	 *
	 * @type {TenantRole}
	 * @memberof Admin
	 */
	@Schema({ type: String, required: false, default: 'admin' })
	@Column()
	role: TenantRole;

	/**
	 * Platform super-admin: may switch into any tenant (Tenant-Id header).
	 * Never settable through the API; set by the first-admin bootstrap or in the DB.
	 *
	 * @type {boolean}
	 * @memberof Admin
	 */
	@Schema({ type: Boolean, required: false, default: false })
	@Column()
	isSuperAdmin: boolean;
}

export default Admin;
