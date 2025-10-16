import UserOrder from './UserOrder';
import Warehouse from './Warehouse';
import OrderProduct from './OrderProduct';
import Carrier from './Carrier';
import {
	DBObject,
	Schema,
	Index,
	ModelName,
	Types,
	getSchema,
} from '../@pyro/db';
import { map } from 'underscore';
import { sum } from 'lodash';

import OrderWarehouseStatus, {
	warehouseStatusToString,
} from '../enums/OrderWarehouseStatus';
import OrderCarrierStatus, {
	carrierStatusToString,
} from '../enums/OrderCarrierStatus';
import IOrder, { IOrderCreateObject } from '../interfaces/IOrder';
import IWarehouse from '../interfaces/IWarehouse';
import ICarrier from '../interfaces/ICarrier';
import OrderStatus from '../enums/OrderStatus';
import ILanguage from '../interfaces/ILanguage';
import { Entity, Column } from 'typeorm';
import IOrderProduct from '../interfaces/IOrderProduct';
import DeliveryType from '../enums/DeliveryType';

/**
 * Customer Order (for some products or services)
 *
 * @class Order
 * @extends {DBObject<IOrder, IOrderCreateObject>}
 * @implements {IOrder}
 */
@ModelName('Order')
@Entity({ name: 'orders' })
class Order extends DBObject<IOrder, IOrderCreateObject> implements IOrder {
	constructor(order: IOrder) {
		super(order);

		if (order) {
			if (order.user) {
				this.user = new UserOrder(order.user);
			}

			if (order.warehouse && typeof order.warehouse !== 'string') {
				this.warehouse = new Warehouse(order.warehouse as IWarehouse);
			}

			if (order.carrier && typeof order.carrier !== 'string') {
				this.carrier = new Carrier(order.carrier as ICarrier);
			}

			if (order.products) {
				this.products = map(
					order.products,
					(orderProduct: IOrderProduct) => {
						return new OrderProduct(orderProduct);
					}
				);
			}
		}
	}

	/**
	 * User who make order. Note: this is not a reference,
	 * but info we put here in the moment when Order is creating.
	 * This is needed because we want to not allow user to change
	 * this data in his profile later so it effects his orders
	 *
	 * @type {UserOrder}
	 * @memberof Order
	 */
	@Index(1)
	@Schema(getSchema(UserOrder))
	user: UserOrder;

	/**
	 * Every order go to single merchant only.
	 * Currently, it is not possible to include items in the order from different merchants!
	 *
	 * @type {(Warehouse | string)}
	 * @memberof Order
	 */
	@Index(1)
	@Types.Ref(Warehouse)
	warehouse: Warehouse | string;

	get warehouseId(): string {
		if (typeof this.warehouse === 'string') {
			return this.warehouse;
		} else {
			return this.warehouse.id;
		}
	}

	/**
	 * Same as for customer, it's not a reference but copy of data about products
	 *
	 * @type {OrderProduct[]}
	 * @memberof Order
	 */
	@Schema([getSchema(OrderProduct)])
	products: OrderProduct[];

	/**
	 * Client can confirm order or order can be auto-confirmed
	 * For example, client make an order from mobile app (press button "Buy").
	 * Next, when he pay by CC mobile app send another request to server and set this field to true (confirm order)
	 * Alternative, could be to ask customer again like "Please confirm your order".
	 * Some stores however, may want orders to be automatically confirmed, e.g. when user click "Buy" button.
	 * They still will set separate request to set this field to "true" in such cases, but do not ask customer
	 * to explicitly confirm order
	 *
	 * Note: this field have nothing to do with Warehouse "ReadyForProcessing"
	 * which is set when warehouse Confirms an order, not when client (customer) confirms it
	 *
	 * @type {boolean}
	 * @memberof Order
	 */
	@Types.Boolean(false)
	@Column()
	isConfirmed: boolean;

	/**
	 * Is Order Cancelled
	 *
	 * @type {boolean}
	 * @memberof Order
	 */
	@Types.Boolean(false)
	@Column()
	isCancelled: boolean;

	/**
	 * Is Order wait for completion by user
	 *
	 * @type {boolean}
	 * @memberof Order
	 */
	@Types.Boolean(false)
	@Column()
	waitForCompletion: boolean;

	/**
	 * Is Order Paid by Customer
	 *
	 * @type {boolean}
	 * @memberof Order
	 */
	@Types.Boolean(false)
	@Column()
	isPaid: boolean;

	/**
	 * Completed may mean it's paid and customer get it
	 * OR customer don't take order and it get back to warehouse. It's FINAL in the flow.
	 *
	 * @readonly
	 * @type {boolean}
	 * @memberof Order
	 */
	get isCompleted(): boolean {
		return (
			(this.isPaid && this.status === OrderStatus.Delivered) ||
			this.isCancelled
		);
	}

	/**
	 * Deliver time for order (DateTime when order was actually delivered to customer)
	 *
	 * @type {Date}
	 * @memberof Order
	 */
	@Schema({ type: Date, required: false })
	@Column()
	deliveryTime?: Date;

	/**
	 * Time when order processing is finished
	 * i.e order become canceled from customer or get failed during Store preparing etc.
	 *
	 * @type {Date}
	 * @memberof Order
	 */
	@Schema({ type: Date, required: false })
	@Column()
	finishedProcessingTime?: Date;

	/**
	 * The time when some carrier start delivery the order
	 *
	 * @type {Date}
	 * @memberof Order
	 */
	@Schema({ type: Date, required: false })
	@Column()
	startDeliveryTime?: Date;

	/**
	 * How many seconds more it should take to delivery order to customer
	 * (reset to 0 when order is delivered or when carrier is not deliver any order to the customer)
	 *
	 * @type {number}
	 * @memberof Order
	 */
	@Types.Number(0)
	@Column()
	deliveryTimeEstimate: number;

	/**
	 * Current Warehouse status of the order
	 *
	 * @type {OrderWarehouseStatus}
	 * @memberof Order
	 */
	@Types.Number(OrderWarehouseStatus.NoStatus)
	@Column()
	warehouseStatus: OrderWarehouseStatus;

	/**
	 * Current Carrier status of the order
	 *
	 * @type {OrderCarrierStatus}
	 * @memberof Order
	 */
	@Types.Number(OrderCarrierStatus.NoCarrier)
	@Column()
	carrierStatus: OrderCarrierStatus;

	/**
	 * Some carrier which responsible to deliver order to the client
	 * (can be empty if order is not planed for delivery yet)
	 *
	 * @type {(Carrier | string | null)}
	 * @memberof Order
	 */
	@Types.Ref(Carrier, { required: false })
	carrier?: Carrier;

	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;

	@Schema({ type: String, required: false })
	@Column()
	stripeChargeId?: string;

	/**
	 * Human readable Order Number in the Store (short id of order, unique in the given store only)
	 *
	 * @type {number}
	 * @memberof Order
	 */
	@Types.Number()
	@Column()
	orderNumber: number;

	/**
	 * Type of the order: Delivery or Takeaway
	 *
	 * @type {DeliveryType}
	 * @memberof Order
	 */
	@Types.Number(DeliveryType.Delivery)
	@Column()
	orderType: DeliveryType;

	get carrierId(): string | null {
		if (this.carrier == null) {
			return null;
		} else if (typeof this.carrier === 'string') {
			return this.carrier;
		} else {
			return this.carrier.id;
		}
	}

	get warehouseStatusText(): string {
		return warehouseStatusToString(this.warehouseStatus);
	}

	get carrierStatusText(): string {
		return carrierStatusToString(this.carrierStatus);
	}

	/**
	 * Get Total Price for an order
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Order
	 */
	get totalPrice(): number {
		return sum(
			map(
				this.products,
				(product: OrderProduct) => product.count * product.price
			)
		);
	}

	/**
	 * TODO: we should refactor and add support for all locales
	 *
	 * @param {ILanguage} language
	 * @returns {string}
	 * @memberof Order
	 */
	getStatusText(language: ILanguage): string {
		switch (language) {
			case 'en-US':
				return this._getStatusTextEnglish();
			case 'he-IL':
				return this._getStatusTextHebrew();
			case 'ru-RU':
				return this._getStatusTextRussian();
			case 'bg-BG':
				return this._getStatusTextBulgarian();
			case 'es-ES':
				return this._getStatusTextSpanish();
			case 'fr-FR':
				return this._getStatusTextFrench();
			default:
				return 'BAD_STATUS';
		}
	}

	/**
	 * Order Status based on Warehouse and Carrier Statuses together
	 *
	 * @readonly
	 * @type {OrderStatus}
	 * @memberof Order
	 */
	get status(): OrderStatus {
		if (
			this.carrier == null ||
			this.carrierStatus <= OrderCarrierStatus.CarrierPickedUpOrder
		) {
			if (this.warehouseStatus >= 200) {
				return OrderStatus.WarehouseIssue;
			} else if (this.isCancelled) {
				return OrderStatus.CanceledWhileWarehousePreparation;
			} else {
				return OrderStatus.WarehousePreparation;
			}
		} else {
			if (this.carrierStatus >= 200) {
				return OrderStatus.CarrierIssue;
			} else if (this.isCancelled) {
				return OrderStatus.CanceledWhileInDelivery;
			} else if (
				this.isPaid &&
				this.carrierStatus === OrderCarrierStatus.DeliveryCompleted
			) {
				return OrderStatus.Delivered;
			} else {
				return OrderStatus.InDelivery;
			}
		}
	}

	private _getStatusTextEnglish(): string {
		switch (this.status) {
			case OrderStatus.WarehousePreparation:
				return 'Preparation';
			case OrderStatus.InDelivery:
				return 'In Delivery';
			case OrderStatus.Delivered:
				return 'Delivered';
			case OrderStatus.CanceledWhileWarehousePreparation:
			case OrderStatus.CanceledWhileInDelivery:
				return 'Cancelled';
			case OrderStatus.WarehouseIssue:
				return 'Preparation Issue';
			case OrderStatus.CarrierIssue:
				return 'Delivery Issue';
			default:
				return 'BAD_STATUS';
		}
	}

	private _getStatusTextBulgarian(): string {
		switch (this.status) {
			case OrderStatus.WarehousePreparation:
				return 'Подготовка';
			case OrderStatus.InDelivery:
				return 'Доставя се';
			case OrderStatus.Delivered:
				return 'Доставено';
			case OrderStatus.CanceledWhileWarehousePreparation:
			case OrderStatus.CanceledWhileInDelivery:
				return 'Отказана';
			case OrderStatus.WarehouseIssue:
				return 'Проблем при подготовката';
			case OrderStatus.CarrierIssue:
				return 'Проблем при доставката';
			default:
				return 'Проблем с поръчката';
		}
	}

	private _getStatusTextHebrew(): string {
		switch (this.status) {
			case OrderStatus.WarehousePreparation:
				return 'בהכנה';
			case OrderStatus.InDelivery:
				return 'במשלוח';
			case OrderStatus.Delivered:
				return 'הסתיים בצלחה';
			case OrderStatus.CanceledWhileWarehousePreparation:
			case OrderStatus.CanceledWhileInDelivery:
				return 'התבטל';
			case OrderStatus.WarehouseIssue:
				return 'בעייה בהכנה';
			case OrderStatus.CarrierIssue:
				return 'בעייה במשלוח';
			default:
				return 'BAD_STATUS';
		}
	}

	private _getStatusTextRussian(): string {
		switch (this.status) {
			case OrderStatus.WarehousePreparation:
				return 'В подготовке';
			case OrderStatus.InDelivery:
				return 'В доставки';
			case OrderStatus.Delivered:
				return 'Доставлено';
			case OrderStatus.CanceledWhileWarehousePreparation:
			case OrderStatus.CanceledWhileInDelivery:
				return 'Отменено';
			case OrderStatus.WarehouseIssue:
				return 'Проблема с подготовкой';
			case OrderStatus.CarrierIssue:
				return 'Проблема с доставкой';
			default:
				return 'BAD_STATUS';
		}
	}

	private _getStatusTextSpanish() {
		switch (this.status) {
			case OrderStatus.WarehousePreparation:
				return 'Preparación';
			case OrderStatus.InDelivery:
				return 'En la entrega';
			case OrderStatus.Delivered:
				return 'Entregado';
			case OrderStatus.CanceledWhileWarehousePreparation:
			case OrderStatus.CanceledWhileInDelivery:
				return 'Cancelado';
			case OrderStatus.WarehouseIssue:
				return 'Problema de preparación';
			case OrderStatus.CarrierIssue:
				return 'Problema de envio';
			default:
				return 'BAD_STATUS';
		}
	}

	private _getStatusTextFrench(): string {
		switch (this.status) {
			case OrderStatus.WarehousePreparation:
				return 'Preparation';
			case OrderStatus.InDelivery:
				return 'En Livraison';
			case OrderStatus.Delivered:
				return 'livré';
			case OrderStatus.CanceledWhileWarehousePreparation:
			case OrderStatus.CanceledWhileInDelivery:
				return 'Annulé';
			case OrderStatus.WarehouseIssue:
				return 'Problème de préparation';
			case OrderStatus.CarrierIssue:
				return 'Problème de livraison';
			default:
				return 'BAD_STATUS';
		}
	}
}

export default Order;
