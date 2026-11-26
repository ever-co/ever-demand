import { ITenantScoped, TenantRole } from './ITenant';
import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';

export interface IAdminCreateObject extends DBCreateObject, ITenantScoped {
	/**
	 * Full name (First Name plus Last Name)
	 *
	 * @type {string}
	 * @memberof IAdminCreateObject
	 */
	name: string;

	email: string;

	/**
	 * Password Hash
	 *
	 * @type {string}
	 * @memberof IAdminCreateObject
	 */
	hash: string;

	pictureUrl: string;
	firstName?: string;
	lastName?: string;
	role?: TenantRole;
	isSuperAdmin?: boolean;
}

export interface IAdminUpdateObject extends DBCreateObject {
	/**
	 * Full name (First Name plus Last Name)
	 *
	 * @type {string}
	 * @memberof IAdminCreateObject
	 */
	name?: string;

	email?: string;
	pictureUrl?: string;
	firstName?: string;
	lastName?: string;
}

interface IAdmin extends DBRawObject, IAdminCreateObject {
	_id: PyroObjectId;
}

export default IAdmin;
