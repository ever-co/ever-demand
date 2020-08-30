import { DBObject, ModelName, Types, Schema } from '@pyro/db';
import { Entity, Column } from 'typeorm';
import Product from './Product';
import {
	IPromotion,
	IPromotionCreateObject,
	IPromotionTitle,
	IPromotionDescription,
} from '../interfaces/IPromotion';
import Warehouse from './Warehouse';
import IWarehouse from '../interfaces/IWarehouse';

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
	/**
	 * @type {IPromotionTitle[]}
	 * @memberof Promotion
	 */
	@Schema({ type: Array, required: true })
	title: IPromotionTitle[];

	/**
	 * @type {IPromotionDescription[]}
	 * @memberof Promotion
	 */
	@Schema({ type: Array, required: false })
	description: IPromotionDescription[];

	/**
	 * @type {boolean}
	 * @memberof Promotion
	 */
	@Types.Boolean(true)
	@Column()
	active: boolean;

	/**
	 * @type {number}
	 * @memberof Promotion
	 */
	@Types.Number()
	@Column()
	promoPrice: number;

	/**
	 * Warehouse promotion is associated with
	 *
	 * @type {IWarehouse}
	 * @memberof Promotion
	 */
	@Types.Ref(Warehouse)
	warehouse: Warehouse;

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

	/**
	 * @type {Product}
	 * @memberof Promotion
	 */
	@Types.Ref(Product)
	product: Product;

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
