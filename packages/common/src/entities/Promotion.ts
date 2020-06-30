import { DBObject, ModelName, Types, Schema } from '@pyro/db';
import { Entity, Column } from 'typeorm';
import Product from './Product';
import { IPromotion, IPromotionCreateObject } from '../interfaces/IPromotion';

/**
 *
 * @class Promotion
 * @extends {DBObject<IPromotion, IPromotionCreateObject>}
 * @implements {IPromotion}
 */
@ModelName('Promotion')
@Entity({ name: 'promotions' })
class Promotion extends DBObject<IPromotion, IPromotionCreateObject>
	implements IPromotion {
	//tstodo

	/**
	 * @type {string}
	 * @memberof Promotion
	 */
	@Schema({ type: String, required: false })
	@Column()
	title: string;

	/**
	 * @type {string}
	 * @memberof Promotion
	 */
	@Schema({ type: String, required: false })
	@Column()
	description: string;

	/**
	 * @type {boolean}
	 * @memberof Promotion
	 */
	@Types.Boolean(true)
	@Column()
	active: boolean;

	/**
	 * @type {Date}
	 * @memberof Promotion
	 */
	@Schema({ type: Date, required: false })
	@Column()
	activeFrom: Date;

	/**
	 * @type {Date}
	 * @memberof Promotion
	 */
	@Schema({ type: Date, required: false })
	@Column()
	activeTo: Date;

	/**
	 * @type {string}
	 * @memberof Promotion
	 */
	@Schema({ type: String, required: false })
	@Column()
	image: string;

	//tstodo
	// /**
	//  * @type {Product}
	//  * @memberof Promotion
	//  */
	// @Types.Ref(Product)
	// product: Product;

	/**
	 * @type {number}
	 * @memberof Promotion
	 */
	@Types.Number()
	@Column()
	purchasesCount: number;

	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
}

export default Promotion;
