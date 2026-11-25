/**
 * Enums mirrored from `packages/common/src/enums`. The app does not import `packages/common`
 * (its entities pull in mongoose and typeorm decorators), so the values are copied here and must
 * stay identical to the server ones.
 */

export enum OrderCarrierStatus {
	NoCarrier = 0,
	CarrierSelectedOrder = 1,
	CarrierPickedUpOrder = 2,
	CarrierStartDelivery = 3,
	CarrierArrivedToCustomer = 4,
	DeliveryCompleted = 5,
	IssuesDuringDelivery = 204,
	ClientRefuseTakingOrder = 205,
}

export enum OrderWarehouseStatus {
	NoStatus = 0,
	ReadyForProcessing = 1,
	WarehouseStartedProcessing = 2,
	AllocationStarted = 3,
	AllocationFinished = 4,
	PackagingStarted = 5,
	PackagingFinished = 6,
	GivenToCarrier = 7,
	GivenToCustomer = 8,
	AllocationFailed = 200,
	PackagingFailed = 201,
}

export enum OrderStatus {
	WarehousePreparation = 0,
	InDelivery = 1,
	Delivered = 2,
	CanceledWhileWarehousePreparation = 200,
	CanceledWhileInDelivery = 201,
	WarehouseIssue = 202,
	CarrierIssue = 203,
}

/** "Purchase type" of an order. */
export enum DeliveryType {
	Delivery = 0,
	Takeaway = 1,
}

export enum RegistrationSystem {
	Enabled = 'enabled',
	Disabled = 'disabled',
	Once = 'once',
}

export enum OrderBarcodeTypes {
	QR = 0,
	CODE128 = 1,
	CODE39 = 2,
	pharmacode = 3,
	MSI = 4,
}

/** Steps of the delivery tracking widget (`DeliveryStatus` in the Ionic order page). */
export enum DeliveryStatus {
	Warehouse = 0,
	Carrier = 1,
	Customer = 2,
	Completed = 3,
}

/** Error name the server uses when the Stripe currency changed since the client loaded it. */
export const STRIPE_CURRENCY_CHANGED_ERROR = 'StripeCurrencyChangedError';

export const LANGUAGES = ['en-US', 'bg-BG', 'he-IL', 'ru-RU', 'es-ES', 'fr-FR'] as const;
export type Language = (typeof LANGUAGES)[number];

export const RTL_LANGUAGES: ReadonlyArray<Language> = ['he-IL'];

export type DevicePlatform = 'browser' | 'android' | 'ios';
