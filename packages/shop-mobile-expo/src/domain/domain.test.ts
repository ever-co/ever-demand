import { order as orderFixture } from '../test/fixtures';
import { DeliveryStatus, DeliveryType, OrderCarrierStatus, OrderStatus, OrderWarehouseStatus } from './enums';
import {
	countryIdByAbbreviation,
	countryName,
	customerAddress,
	deliveryDuration,
	deliveryStep,
	deliveryTimeRange,
	getIdFromTheDate,
	hasDeliveryIssue,
	hasWarehouseIssue,
	inviteRequestAddress,
	isOrderCompleted,
	orderStatus,
	orderStatusText,
	orderTotalPrice,
	orderWarehouseId,
	statusKeyPrefix,
	storeFullAddress,
} from './order';
import { deliveryInfo, discountPercent, orderProductImage, pickTranslation, productDetailsImages, shorten } from './product';

const carrier = { id: 'carrier-1' };

describe('order getters (packages/common Order entity)', () => {
	it('status from the warehouse and carrier statuses', () => {
		expect(orderStatus(orderFixture())).toBe(OrderStatus.WarehousePreparation);
		expect(orderStatus(orderFixture({ warehouseStatus: OrderWarehouseStatus.AllocationFailed }))).toBe(OrderStatus.WarehouseIssue);
		expect(orderStatus(orderFixture({ isCancelled: true }))).toBe(OrderStatus.CanceledWhileWarehousePreparation);
		expect(orderStatus(orderFixture({ carrier, carrierStatus: OrderCarrierStatus.CarrierStartDelivery }))).toBe(OrderStatus.InDelivery);
		expect(orderStatus(orderFixture({ carrier, carrierStatus: OrderCarrierStatus.IssuesDuringDelivery }))).toBe(OrderStatus.CarrierIssue);
		expect(orderStatus(orderFixture({ carrier, carrierStatus: OrderCarrierStatus.DeliveryCompleted, isPaid: true }))).toBe(OrderStatus.Delivered);
		expect(orderStatus(orderFixture({ carrier, carrierStatus: OrderCarrierStatus.DeliveryCompleted, isCancelled: true }))).toBe(OrderStatus.CanceledWhileInDelivery);
		// GraphQL rows carry the computed status only
		expect(orderStatus({ id: 'x', products: [], status: OrderStatus.Delivered })).toBe(OrderStatus.Delivered);
	});

	it('isCompleted: paid and delivered, or cancelled', () => {
		expect(isOrderCompleted(orderFixture())).toBe(false);
		expect(isOrderCompleted(orderFixture({ isCancelled: true }))).toBe(true);
		expect(isOrderCompleted(orderFixture({ carrier, carrierStatus: OrderCarrierStatus.DeliveryCompleted, isPaid: true }))).toBe(true);
		expect(isOrderCompleted(null)).toBe(false);
	});

	it('delivery steps We / Carrier / You / completed', () => {
		expect(deliveryStep(null)).toBe(DeliveryStatus.Warehouse);
		expect(deliveryStep(orderFixture({ carrier, carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder }))).toBe(DeliveryStatus.Carrier);
		expect(deliveryStep(orderFixture({ carrier, carrierStatus: OrderCarrierStatus.CarrierArrivedToCustomer }))).toBe(DeliveryStatus.Customer);
		expect(deliveryStep(orderFixture({ carrier, carrierStatus: OrderCarrierStatus.DeliveryCompleted, isPaid: true }))).toBe(DeliveryStatus.Completed);
	});

	it('status i18n keys, cancelled orders use BUY_POPUP.CANCEL', () => {
		expect(statusKeyPrefix(orderFixture())).toBe('BUY_POPUP.STATUSES.0');
		expect(statusKeyPrefix(orderFixture({ isCancelled: true }))).toBe('BUY_POPUP.CANCEL.STATUSES.0');
	});

	it('delivery time range from the products, else 30-60', () => {
		expect(deliveryTimeRange(orderFixture())).toBe('20-40');
		const noTimes = orderFixture();
		noTimes.products = noTimes.products.map((p) => ({ ...p, deliveryTimeMin: null, deliveryTimeMax: null }));
		expect(deliveryTimeRange(noTimes)).toBe('30-60');
		const onlyMax = orderFixture();
		onlyMax.products = onlyMax.products.map((p) => ({ ...p, deliveryTimeMin: 0, deliveryTimeMax: 15 }));
		expect(deliveryTimeRange(onlyMax)).toBe('15');
	});

	it('issues, with the page default while the order is loading', () => {
		expect(hasDeliveryIssue(null)).toBe(false);
		expect(hasDeliveryIssue(null, true)).toBe(true);
		expect(hasDeliveryIssue(orderFixture({ carrierStatus: OrderCarrierStatus.ClientRefuseTakingOrder }))).toBe(true);
		expect(hasWarehouseIssue(orderFixture({ warehouseStatus: OrderWarehouseStatus.PackagingFailed }))).toBe(true);
	});

	it('total price, short id, warehouse id, durations', () => {
		const order = orderFixture();
		order.products.push({ ...order.products[0], count: 2, price: 5 });
		expect(orderTotalPrice(order)).toBe(20);
		const local = new Date(order.createdAt!);
		const expected = `${`0${local.getDate()}`.slice(-2)}${`0${local.getMonth() + 1}`.slice(-2)}${local.getFullYear()}-7`;
		expect(getIdFromTheDate(order)).toBe(expected);
		expect(() => getIdFromTheDate({ id: 'x', products: [] })).toThrow(/createdAt/);
		expect(orderWarehouseId({ id: 'x', products: [], warehouse: 'w-1' })).toBe('w-1');
		expect(orderWarehouseId(order)).toBe('warehouse-1');
		expect(deliveryDuration({ ...order, deliveryTime: '2026-11-25T10:25:30.000Z' })).toBe('25:30 min');
		expect(deliveryDuration(order)).toBeNull();
	});

	it('addresses and countries', () => {
		expect(countryIdByAbbreviation('BG')).toBe(21);
		expect(countryIdByAbbreviation('il')).toBe(102);
		expect(countryName(21)).toBe('Bulgaria');
		expect(customerAddress(orderFixture())).toBe('Bulgaria 1700, Sofia');
		expect(storeFullAddress(orderFixture().warehouse as never)).toBe('Sofia, Simeonovsko shose 104, 1700,  Bulgaria');
		expect(inviteRequestAddress({ id: 'r', apartment: '3', geoLocation: orderFixture().user!.geoLocation })).toBe('Simeonovsko shose 104/3, Sofia');
	});

	it('status texts per language (Order.getStatusText)', () => {
		expect(orderStatusText(orderFixture(), 'en-US')).toBe('Preparation');
		expect(orderStatusText(orderFixture({ isCancelled: true }), 'fr-FR')).toBe('Annulé');
		expect(orderStatusText(orderFixture(), 'xx')).toBe('BAD_STATUS');
	});
});

describe('product helpers', () => {
	const members = [
		{ locale: 'en-US', value: 'Pizza' },
		{ locale: 'he-IL', value: 'פיצה' },
	];

	it('picks the current language, then the default one, then the first', () => {
		expect(pickTranslation(members, 'he-IL')).toBe('פיצה');
		expect(pickTranslation(members, 'ru-RU')).toBe('Pizza');
		expect(pickTranslation([{ locale: 'bg-BG', value: 'Пица' }], 'ru-RU')).toBe('Пица');
		expect(pickTranslation([{ locale: 'en-US', url: 'img.png' }], 'en-US')).toBe('img.png');
		expect(pickTranslation(null, 'en-US')).toBe('');
	});

	it('shortens with an ellipsis', () => {
		expect(shorten('short', 10)).toBe('short');
		expect(shorten('a'.repeat(60), 53)).toBe(`${'a'.repeat(50)}...`);
	});

	it('discount percent', () => {
		expect(discountPercent({ price: 75, initialPrice: 100 })).toBe(25);
		expect(discountPercent({ price: 10, initialPrice: 10 })).toBe(0);
		expect(discountPercent({ price: 10 })).toBe(0);
	});

	it('delivery badge texts', () => {
		const texts = { minutes: 'min', readyFor: 'Ready for', delivery: 'Delivery', takeaway: 'Takeout' };
		const defaults = { min: 30, max: 60 };
		expect(deliveryInfo({ deliveryTimeMin: 20, deliveryTimeMax: 40 }, DeliveryType.Delivery, texts, defaults)).toEqual({ icon: 'moped', line1: '20-40 min', line2: 'Delivery' });
		expect(deliveryInfo({ deliveryTimeMin: null, deliveryTimeMax: null }, DeliveryType.Delivery, texts, defaults)?.line1).toBe('30-60 min');
		expect(deliveryInfo({ deliveryTimeMin: 5, deliveryTimeMax: 10 }, DeliveryType.Takeaway, texts, defaults)).toEqual({ icon: 'flash', line1: 'Ready for', line2: 'Takeout' });
		expect(deliveryInfo({ deliveryTimeMin: 20, deliveryTimeMax: 40 }, DeliveryType.Takeaway, texts, defaults)?.line1).toBe('20-40 min');
	});

	it('product details image rules', () => {
		const h = (n: number) => ({ locale: 'en-US', url: `h${n}`, orientation: 2 });
		const v = (n: number) => ({ locale: 'en-US', url: `v${n}`, orientation: 1 });
		expect(productDetailsImages([v(1)])).toEqual({ single: v(1), carousel: [] });
		expect(productDetailsImages([v(1), h(1)])).toEqual({ single: h(1), carousel: [] });
		expect(productDetailsImages([v(1), h(1), h(2)]).carousel).toEqual([h(1), h(2)]);
		expect(productDetailsImages([v(1), v(2), h(1)]).carousel).toEqual([v(1), v(2)]);
		expect(productDetailsImages([h(1), h(2)]).carousel).toEqual([h(1), h(2)]);
	});

	it('order card image: current language, else en-US', () => {
		const images = [
			{ locale: 'en-US', url: 'en' },
			{ locale: 'bg-BG', url: 'bg' },
		];
		expect(orderProductImage(images, 'bg-BG')?.url).toBe('bg');
		expect(orderProductImage(images, 'fr-FR')?.url).toBe('en');
	});
});
