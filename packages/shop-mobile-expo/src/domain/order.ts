/**
 * Order getters of `packages/common/src/entities/Order.ts` and the order pages of the Ionic app,
 * as plain functions over the raw order objects the server sends.
 */
import { COUNTRIES } from './countries.data';
import {
	DeliveryStatus,
	OrderCarrierStatus,
	OrderStatus,
	OrderWarehouseStatus,
	type Language,
} from './enums';
import type { InviteRequest, Order, Warehouse } from './types';

/** `Order.status`: combined status from the warehouse and carrier statuses. */
export function orderStatus(order: Order): OrderStatus {
	if (order.carrierStatus == null || order.warehouseStatus == null) {
		return (order.status ?? OrderStatus.WarehousePreparation) as OrderStatus;
	}

	const carrierStatus = order.carrierStatus;

	if (order.carrier == null || carrierStatus <= OrderCarrierStatus.CarrierPickedUpOrder) {
		if (order.warehouseStatus >= 200) {
			return OrderStatus.WarehouseIssue;
		}
		return order.isCancelled
			? OrderStatus.CanceledWhileWarehousePreparation
			: OrderStatus.WarehousePreparation;
	}

	if (carrierStatus >= 200) {
		return OrderStatus.CarrierIssue;
	}
	if (order.isCancelled) {
		return OrderStatus.CanceledWhileInDelivery;
	}
	if (order.isPaid && carrierStatus === OrderCarrierStatus.DeliveryCompleted) {
		return OrderStatus.Delivered;
	}
	return OrderStatus.InDelivery;
}

/** `Order.isCompleted`: paid and delivered, or cancelled. */
export function isOrderCompleted(order: Order | null | undefined): boolean {
	if (!order) {
		return false;
	}
	if (order.carrierStatus == null && order.isCompleted != null) {
		return order.isCompleted;
	}
	return (!!order.isPaid && orderStatus(order) === OrderStatus.Delivered) || !!order.isCancelled;
}

/** `Order.totalPrice`: sum of `count * price` over the products. */
export function orderTotalPrice(order: Order | null | undefined): number {
	if (!order) {
		return 0;
	}
	return order.products.reduce((sum, product) => sum + product.count * product.price, 0);
}

/** Step of the delivery widget (We / Carrier / You / completed). */
export function deliveryStep(order: Order | null | undefined): DeliveryStatus {
	if (!order) {
		return DeliveryStatus.Warehouse;
	}
	if (isOrderCompleted(order) && !order.isCancelled) {
		return DeliveryStatus.Completed;
	}
	const carrierStatus = order.carrierStatus ?? OrderCarrierStatus.NoCarrier;
	if (carrierStatus >= OrderCarrierStatus.CarrierArrivedToCustomer) {
		return DeliveryStatus.Customer;
	}
	if (carrierStatus >= OrderCarrierStatus.CarrierPickedUpOrder) {
		return DeliveryStatus.Carrier;
	}
	return DeliveryStatus.Warehouse;
}

/** Largest product delivery min/max times as "min-max", one of them, or `30-60`. */
export function deliveryTimeRange(order: Order | null | undefined): string {
	if (!order) {
		return '';
	}
	let min = 0;
	let max = 0;
	for (const product of order.products) {
		if (product.deliveryTimeMin && product.deliveryTimeMin > min) {
			min = product.deliveryTimeMin;
		}
		if (product.deliveryTimeMax && product.deliveryTimeMax > max) {
			max = product.deliveryTimeMax;
		}
	}
	if (min !== 0 && max !== 0) {
		return `${min}-${max}`;
	}
	if (min !== 0) {
		return `${min}`;
	}
	if (max !== 0) {
		return `${max}`;
	}
	return '30-60';
}

/**
 * Delivery issue: `carrierStatus >= IssuesDuringDelivery`. `whenMissing` is what the page returns
 * while the order has not loaded yet: the delivery modal says "no issue", the pages say "issue".
 */
export function hasDeliveryIssue(order: Order | null | undefined, whenMissing = false): boolean {
	if (!order) {
		return whenMissing;
	}
	return (order.carrierStatus ?? 0) >= OrderCarrierStatus.IssuesDuringDelivery;
}

export function hasWarehouseIssue(order: Order | null | undefined, whenMissing = false): boolean {
	if (!order) {
		return whenMissing;
	}
	return (order.warehouseStatus ?? 0) >= OrderWarehouseStatus.AllocationFailed;
}

/** i18n key prefix for the status texts: `BUY_POPUP[.CANCEL].STATUSES.<step>`. */
export function statusKeyPrefix(order: Order | null | undefined): string {
	return `BUY_POPUP.${order?.isCancelled ? 'CANCEL.' : ''}STATUSES.${deliveryStep(order)}`;
}

/** `getIdFromTheDate`: `ddmmyyyy-<orderNumber>`, from the local date parts. */
export function getIdFromTheDate(order: Order): string {
	const createdAt = order.createdAt || order._createdAt;
	if (!createdAt || order.orderNumber == null) {
		throw new Error(
			`Can't use getIdFromTheDate function. Property ${
				!createdAt ? 'createdAt' : 'orderNumber'
			} is missing!`,
		);
	}
	const date = new Date(createdAt);
	const d = `0${date.getDate()}`.slice(-2);
	const m = `0${date.getMonth() + 1}`.slice(-2);
	return `${d}${m}${date.getFullYear()}-${order.orderNumber}`;
}

/** The populated warehouse of an order, or null when the order has only its id. */
export function orderWarehouse(order: Order | null | undefined): Warehouse | null {
	if (order && order.warehouse && typeof order.warehouse === 'object') {
		return order.warehouse;
	}
	return null;
}

/** `Order.warehouseId`: the warehouse id whether the warehouse is populated or not. */
export function orderWarehouseId(order: Order | null | undefined): string | null {
	if (!order) {
		return null;
	}
	if (order.warehouseId) {
		return order.warehouseId;
	}
	if (typeof order.warehouse === 'string') {
		return order.warehouse;
	}
	return order.warehouse?.id ?? order.warehouse?._id ?? null;
}

export function orderId(order: Order): string {
	return order.id ?? order._id ?? '';
}

export function countryName(countryId: number | null | undefined): string | null {
	if (countryId == null) {
		return null;
	}
	return COUNTRIES[countryId]?.[1] ?? null;
}

/** Country id for an abbreviation such as `BG`, or null when unknown. */
export function countryIdByAbbreviation(abbreviation: string | null | undefined): number | null {
	if (!abbreviation) {
		return null;
	}
	const index = COUNTRIES.findIndex(([abbr]) => abbr === abbreviation.toUpperCase());
	return index === -1 ? null : index;
}

/** "city, street house, [postcode, ] country" of a store. */
export function storeFullAddress(warehouse: Warehouse | null | undefined): string {
	const geo = warehouse?.geoLocation;
	if (!geo) {
		return '';
	}
	return (
		`${geo.city}, ${geo.streetAddress} ${geo.house}, ` +
		`${geo.postcode ? `${geo.postcode}, ` : ''} ${countryName(geo.countryId) ?? ''}`
	);
}

/** "countryName postcode, city" of the order's customer, as on the order card. */
export function customerAddress(order: Order): string {
	const geo = order.user?.geoLocation;
	if (!geo) {
		return '';
	}
	const country = geo.countryName ?? countryName(geo.countryId) ?? '';
	return `${country} ${geo.postcode ?? ''}, ${geo.city ?? ''}`;
}

/** `InviteRequest.toAddressString()`: "street house[/apartment], city". */
export function inviteRequestAddress(request: InviteRequest | null | undefined): string | null {
	if (!request?.geoLocation) {
		return null;
	}
	let address = `${request.geoLocation.streetAddress} ${request.geoLocation.house}`;
	if (request.apartment) {
		address += `/${request.apartment}`;
	}
	return `${address}, ${request.geoLocation.city}`;
}

/** "m:ss min" between creation and delivery, or null when not delivered. */
export function deliveryDuration(order: Order): string | null {
	if (order.deliveryTime == null || !order.createdAt) {
		return null;
	}
	const ms = new Date(order.deliveryTime).getTime() - new Date(order.createdAt).getTime();
	const minutes = Math.floor(ms / 60000);
	const seconds = Math.round((ms % 60000) / 1000);
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} min`;
}

export function isOrderCanceled(order: Order): boolean {
	const status = orderStatus(order);
	return (
		status === OrderStatus.CanceledWhileInDelivery ||
		status === OrderStatus.CanceledWhileWarehousePreparation
	);
}

export function isOrderFailed(order: Order): boolean {
	const status = orderStatus(order);
	return status === OrderStatus.CarrierIssue || status === OrderStatus.WarehouseIssue;
}

export function isOrderInProcessing(order: Order): boolean {
	return orderStatus(order) < OrderStatus.Delivered;
}

export function isTakeawayOrder(order: Order): boolean {
	return order.products.some((product) => product.isTakeaway);
}

const STATUS_TEXTS: Record<Language, Record<number, string>> = {
	'en-US': {
		[OrderStatus.WarehousePreparation]: 'Preparation',
		[OrderStatus.InDelivery]: 'In Delivery',
		[OrderStatus.Delivered]: 'Delivered',
		[OrderStatus.CanceledWhileWarehousePreparation]: 'Cancelled',
		[OrderStatus.CanceledWhileInDelivery]: 'Cancelled',
		[OrderStatus.WarehouseIssue]: 'Preparation Issue',
		[OrderStatus.CarrierIssue]: 'Delivery Issue',
	},
	'bg-BG': {
		[OrderStatus.WarehousePreparation]: 'Подготовка',
		[OrderStatus.InDelivery]: 'Доставя се',
		[OrderStatus.Delivered]: 'Доставено',
		[OrderStatus.CanceledWhileWarehousePreparation]: 'Отказана',
		[OrderStatus.CanceledWhileInDelivery]: 'Отказана',
		[OrderStatus.WarehouseIssue]: 'Проблем при подготовката',
		[OrderStatus.CarrierIssue]: 'Проблем при доставката',
	},
	'he-IL': {
		[OrderStatus.WarehousePreparation]: 'בהכנה',
		[OrderStatus.InDelivery]: 'במשלוח',
		[OrderStatus.Delivered]: 'הסתיים בצלחה',
		[OrderStatus.CanceledWhileWarehousePreparation]: 'התבטל',
		[OrderStatus.CanceledWhileInDelivery]: 'התבטל',
		[OrderStatus.WarehouseIssue]: 'בעייה בהכנה',
		[OrderStatus.CarrierIssue]: 'בעייה במשלוח',
	},
	'ru-RU': {
		[OrderStatus.WarehousePreparation]: 'В подготовке',
		[OrderStatus.InDelivery]: 'В доставки',
		[OrderStatus.Delivered]: 'Доставлено',
		[OrderStatus.CanceledWhileWarehousePreparation]: 'Отменено',
		[OrderStatus.CanceledWhileInDelivery]: 'Отменено',
		[OrderStatus.WarehouseIssue]: 'Проблема с подготовкой',
		[OrderStatus.CarrierIssue]: 'Проблема с доставкой',
	},
	'es-ES': {
		[OrderStatus.WarehousePreparation]: 'Preparación',
		[OrderStatus.InDelivery]: 'En la entrega',
		[OrderStatus.Delivered]: 'Entregado',
		[OrderStatus.CanceledWhileWarehousePreparation]: 'Cancelado',
		[OrderStatus.CanceledWhileInDelivery]: 'Cancelado',
		[OrderStatus.WarehouseIssue]: 'Problema de preparación',
		[OrderStatus.CarrierIssue]: 'Problema de envio',
	},
	'fr-FR': {
		[OrderStatus.WarehousePreparation]: 'Preparation',
		[OrderStatus.InDelivery]: 'En Livraison',
		[OrderStatus.Delivered]: 'livré',
		[OrderStatus.CanceledWhileWarehousePreparation]: 'Annulé',
		[OrderStatus.CanceledWhileInDelivery]: 'Annulé',
		[OrderStatus.WarehouseIssue]: 'Problème de préparation',
		[OrderStatus.CarrierIssue]: 'Problème de livraison',
	},
};

/** `Order.getStatusText(language)` (hard-coded per language on the server entity). */
export function orderStatusText(order: Order, language: string): string {
	const texts = STATUS_TEXTS[language as Language];
	if (!texts) {
		return 'BAD_STATUS';
	}
	return texts[orderStatus(order)] ?? (language === 'bg-BG' ? 'Проблем с поръчката' : 'BAD_STATUS');
}
