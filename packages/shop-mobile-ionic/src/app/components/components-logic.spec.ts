import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import OrderStatus from '@modules/server.common/enums/OrderStatus';
import { SafePipe } from '@modules/client.common.angular2/pipes/safe.pipe';
import { ReplacePipe } from '@modules/client.common.angular2/pipes/replace.pipe';
import { CapitalizePipe } from '@modules/client.common.angular2/pipes/capitalize.pipe';
import { PluralPipe } from '@modules/client.common.angular2/pipes/plural.pipe';
import { RoundPipe } from '@modules/client.common.angular2/pipes/round.pipe';
import { TimingPipe } from '@modules/client.common.angular2/pipes/timing.pipe';
import { NumberWithCommasPipe } from '@modules/client.common.angular2/pipes/number-with-commas.pipe';
import { environment } from 'environments/environment';
import { translateTesting } from 'app/testing/translate';
import { DiscountComponent } from './products/discount/discount';
import { DeliveryInfoComponent } from './products/delivery-info/delivery-info';
import { ElapsedTimeComponent } from './elapsed-time/elapsed-time.component';
import { OrderComponent } from './order/order.component';

// Lets every pending promise callback run.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('DiscountComponent', () => {
	const discountOf = (product: any) => {
		const component = new DiscountComponent();
		component.currentProduct = product;
		return component.getDiscount();
	};

	it('shows the discount in percent, rounded down', () => {
		expect(discountOf({ price: 75, initialPrice: 100 })).toBe(25);
		expect(discountOf({ price: 9.99, initialPrice: 12 })).toBe(16);
	});

	it('shows no discount without an initial price or a lower price', () => {
		expect(discountOf(null)).toBe(0);
		expect(discountOf({ price: 10, initialPrice: 0 })).toBe(0);
		expect(discountOf({ price: 10, initialPrice: 10 })).toBe(0);
	});
});

describe('DeliveryInfoComponent', () => {
	const create = async (deliveryType: DeliveryType, product: any) => {
		TestBed.configureTestingModule({ imports: [...translateTesting()] });
		const translate = TestBed.inject(TranslateService);
		translate.setTranslation('en-US', {
			PRODUCTS_VIEW: {
				DELIVERY: 'Delivery',
				TAKEAWAY: 'Takeout',
				MINUTES: 'min',
				READYFOR: 'Ready for',
			},
		});
		translate.use('en-US');
		const component = new DeliveryInfoComponent(translate, {
			deliveryType,
		} as any);
		component.currentProduct = product;
		component.ngOnInit();
		await settle();
		return component;
	};

	it('shows the delivery time range of a delivery product', async () => {
		const info = await create(DeliveryType.Delivery, {
			isDeliveryRequired: true,
			deliveryTimeMin: 20,
			deliveryTimeMax: 40,
		});

		expect(info.getProductDeliverySignIconName()).toBe('fa-motorcycle');
		expect(info.getProductDeliveryLine1()).toBe('20-40 min');
		expect(info.getProductDeliveryLine2()).toBe('Delivery');
		expect(info.getIsInstant(info.currentProduct)).toBe(false);
	});

	it('falls back to the configured delivery time', async () => {
		const info = await create(DeliveryType.Delivery, {
			isDeliveryRequired: true,
		});

		expect(info.getProductDeliveryLine1()).toBe(
			`${environment.DELIVERY_TIME_MIN}-${environment.DELIVERY_TIME_MAX} min`,
		);
	});

	it('shows an instant takeaway as "Ready for"', async () => {
		const info = await create(DeliveryType.Takeaway, {
			isDeliveryRequired: false,
			deliveryTimeMax: 10,
		});

		expect(info.getProductDeliverySignIconName()).toBe('fa-bolt');
		expect(info.getProductDeliveryLine1()).toBe('Ready for');
		expect(info.getProductDeliveryLine2()).toBe('Takeout');
		expect(info.getIsInstant(info.currentProduct)).toBe(true);
	});

	it('shows the time range of a slower takeaway', async () => {
		const info = await create(DeliveryType.Takeaway, {
			isDeliveryRequired: false,
			deliveryTimeMin: 20,
			deliveryTimeMax: 30,
		});

		expect(info.getProductDeliveryLine1()).toBe('20-30 min');
	});
});

describe('ElapsedTimeComponent', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('counts the time since the order started', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-25T10:05:07Z'));
		localStorage.setItem(
			'startDate',
			JSON.stringify('2026-11-25T10:00:00Z'),
		);
		const shown = [{ timePassed: '' }];

		new ElapsedTimeComponent({} as any).updateTime(shown);

		expect(shown[0].timePassed).toBe('05 : 07');
	});

	it('shows hours after an hour', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-25T11:02:03Z'));
		localStorage.setItem(
			'startDate',
			JSON.stringify('2026-11-25T10:00:00Z'),
		);
		const shown = [{ timePassed: '' }];

		new ElapsedTimeComponent({} as any).updateTime(shown);

		expect(shown[0].timePassed).toBe('1 : 02 : 03');
	});

	it('shows the frozen end time of a delivered order instead of ticking', () => {
		const elapsed = new ElapsedTimeComponent({
			endOrderTime: JSON.stringify({ timePassed: '12 : 00' }),
		} as any);

		elapsed.ngOnInit();

		expect(elapsed.timePasssed).toEqual({ timePassed: '12 : 00' });
		expect(elapsed.timer).toBeUndefined();
	});
});

describe('OrderComponent (order card)', () => {
	const card = (order: any) => {
		const component = new OrderComponent(
			document,
			{ language: 'en-US', deliveryType: DeliveryType.Delivery } as any,
			{ navigateRoot: vi.fn() } as any,
			{} as any,
		);
		component.order = order;
		return component;
	};

	const order = (fields: any = {}) => ({
		id: 'order-1',
		createdAt: '2026-11-25T10:00:00Z',
		deliveryTime: '2026-11-25T10:42:30Z',
		status: OrderStatus.Delivered,
		products: [
			{ count: 2, price: 5, isTakeaway: false },
			{ count: 1, price: 3.5, isTakeaway: false },
		],
		user: {
			geoLocation: {
				countryName: 'Bulgaria',
				postcode: '1700',
				city: 'Sofia',
			},
		},
		warehouse: { logo: 'logo.png' },
		...fields,
	});

	it('sums the products and shows the delivery address and time', () => {
		const c = card(order());

		expect(c.totalPrice).toBe(13.5);
		expect(c.customerAddress).toBe('Bulgaria 1700, Sofia');
		expect(c.deliveryTime).toBe('42:30 min');
		expect(c.warehouseLogo).toBe('logo.png');
		expect(c.inProcessing).toBe(false);
	});

	it('colours cancelled and failed orders', () => {
		expect(
			card(order({ status: OrderStatus.CanceledWhileInDelivery }))
				.badgeClass,
		).toBe('badge-energized');
		expect(
			card(order({ status: OrderStatus.CarrierIssue })).badgeClass,
		).toBe('badge-assertive');
		expect(card(order()).badgeClass).toBe('badge-balanced');
		expect(
			card(order({ status: OrderStatus.WarehouseIssue })).isFailed,
		).toBe(true);
		expect(
			card(
				order({
					status: OrderStatus.CanceledWhileWarehousePreparation,
				}),
			).isCanceled,
		).toBe(true);
	});

	it('knows a takeaway order and one still in progress', () => {
		const c = card(
			order({
				status: OrderStatus.WarehousePreparation,
				deliveryTime: null,
				products: [{ count: 1, price: 1, isTakeaway: true }],
			}),
		);

		expect(c.isTakeaway).toBe(true);
		expect(c.inProcessing).toBe(true);
		expect(c.deliveryTime).toBeNull();
	});
});

describe('shared pipes (common-angular PipesModule)', () => {
	it('safe: trusts HTML for [innerHTML] and refuses an unknown type', () => {
		TestBed.configureTestingModule({});
		const pipe = new SafePipe(TestBed.inject(DomSanitizer));

		expect(pipe.transform('<b>hi</b>', 'html')).toBeTruthy();
		expect(() => pipe.transform('x', 'nope')).toThrow(
			'Invalid safe type specified: nope',
		);
	});

	it('replace, capitalize, plural, round, timing, number with commas', () => {
		expect(new ReplacePipe().transform('a-b-c', '-', '+')).toBe('a+b+c');
		expect(() => new ReplacePipe().transform(1 as any, '-', '+')).toThrow();
		expect(new CapitalizePipe().transform('hELLO')).toBe('Hello');
		expect(new PluralPipe().transform(1, 'order')).toBe('1 order');
		expect(new PluralPipe().transform(3, 'order')).toBe('3 orders');
		expect(new PluralPipe().transform(2, 'child', 'children')).toBe(
			'2 children',
		);
		expect(new RoundPipe().transform(2.5)).toBe(3);
		expect(new TimingPipe().transform(125)).toBe('02:05');
		expect(new TimingPipe().transform(0)).toBe('00:00');
		expect(new NumberWithCommasPipe().transform(1234567)).toBe(
			new Intl.NumberFormat().format(1234567),
		);
	});
});
