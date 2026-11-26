import { DBObject, ModelName, Schema, Types } from '../@pyro/db';
import { Entity, Column } from 'typeorm';
import ITenant, {
	ITenantBilling,
	ITenantCreateObject,
	ITenantSettings,
	TenantPlan,
	TenantStatus,
} from '../interfaces/ITenant';

/**
 * A tenant: one business that signed up (or the default tenant of a
 * single-tenant install). Every tenant-owned record carries its id in
 * `tenantId`. Tenants themselves are global, not tenant-owned.
 *
 * @class Tenant
 * @extends {DBObject<ITenant, ITenantCreateObject>}
 * @implements {ITenant}
 */
@ModelName('Tenant')
@Entity({ name: 'tenants' })
class Tenant extends DBObject<ITenant, ITenantCreateObject> implements ITenant {
	/**
	 * Business name
	 *
	 * @type {string}
	 * @memberof Tenant
	 */
	@Schema({ type: String, required: true })
	@Column()
	name: string;

	/**
	 * Short unique code, also the sub-domain: `<slug>.everdemand.co`
	 *
	 * @type {string}
	 * @memberof Tenant
	 */
	@Schema({ type: String, required: true, unique: true, lowercase: true })
	@Column()
	slug: string;

	@Schema({ type: String, required: false, default: 'active' })
	@Column()
	status: TenantStatus;

	/**
	 * Admin that owns the tenant (role owner)
	 *
	 * @type {string}
	 * @memberof Tenant
	 */
	@Schema({ type: String, required: false })
	@Column()
	ownerId?: string;

	@Schema({ type: String, required: false, default: 'starter' })
	@Column()
	plan: TenantPlan;

	@Schema({
		type: {
			stripeCustomerId: { type: String, required: false },
			stripeSubscriptionId: { type: String, required: false },
			status: { type: String, required: false },
			interval: { type: String, required: false },
			extraMembers: { type: Number, required: false },
			trialEndsAt: { type: Date, required: false },
			currentPeriodEnd: { type: Date, required: false },
			pastDueSince: { type: Date, required: false },
		},
		required: false,
		default: {},
	})
	@Column()
	billing: ITenantBilling;

	@Schema({
		type: {
			currency: { type: String, required: false },
			language: { type: String, required: false },
			logoUrl: { type: String, required: false },
			domains: { type: [String], required: false },
			marketplaceListed: { type: Boolean, required: false },
		},
		required: false,
		default: {},
	})
	@Column()
	settings: ITenantSettings;

	@Schema({ type: Boolean, required: false, default: false })
	@Column()
	isPlatform: boolean;

	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
}

export default Tenant;
