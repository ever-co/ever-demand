import { of } from 'rxjs';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';

describe('OrdersComponent', () => {
	it('sums the total price of the orders', () => {
		const component = new OrdersComponent();
		component.orders = [
			{ totalPrice: 10 },
			{ totalPrice: 2.5 },
			{ totalPrice: 0 },
		] as any[];

		component.ngOnInit();

		expect(component.ordersSum).toBe(12.5);
	});
});

describe('OrderComponent', () => {
	const order = {
		_id: 'o1',
		warehouseId: 'w1',
		carrierId: null,
		orderNumber: 7,
		orderType: 0,
		totalPrice: 12,
		warehouseStatus: 1,
		carrierStatus: 0,
		warehouseStatusText: 'WAREHOUSE_STATUS_TEXT',
		createdAt: new Date('2026-01-01T10:00:00Z'),
		user: { geoLocation: { notes: '' } },
		products: [
			{
				price: 12,
				product: {
					title: [{ locale: 'en-US', value: 'Pizza' }],
					description: [{ locale: 'en-US', value: 'Hot' }],
					images: [{ locale: 'en-US', url: 'pizza.png' }],
				},
			},
		],
	};

	function create(orderCancelation: object | null) {
		const warehouseRouter = {
			get: vi.fn().mockReturnValue(of({ orderCancelation })),
		};
		const warehouseOrdersRouter = { cancel: vi.fn().mockResolvedValue({}) };
		const dialog = {
			open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }),
		};
		const component = new OrderComponent(
			document,
			warehouseOrdersRouter as any,
			warehouseRouter as any,
			{ get: vi.fn() } as any,
			{
				getTranslate: (member: any[]) =>
					member.length ? member[0].value ?? member[0].url : '',
			} as any,
			{ get: () => of('') } as any,
			dialog as any,
			{ run: (fn: () => void) => fn() } as any
		);
		component.order = order as any;
		component.ngOnInit();
		return { component, warehouseOrdersRouter, dialog };
	}

	it('shows the first product, the price and the status key', () => {
		const { component } = create(null);

		expect(component.title).toBe('Pizza');
		expect(component.description).toBe('Hot');
		expect(component.price).toBe(12);
		expect(component.orderNumber).toBe(7);
		expect(component.orderStatusTextTranslates).toBe(
			'ORDER_CARRIER_STATUS.WAREHOUSE_STATUS_TEXT'
		);
	});

	it('allows cancelling when the store has no cancellation rule', () => {
		const { component } = create(null);

		expect(component._isButtonDisabled).toBe(false);
	});

	it('allows cancelling before the state the store set', () => {
		const { component } = create({ enabled: true, onState: 2 });

		expect(component._isButtonDisabled).toBe(false);
	});

	it('refuses cancelling from the state the store set', () => {
		const { component } = create({ enabled: true, onState: 1 });

		expect(component._isButtonDisabled).toBe(true);
		expect(() => component.openDialog()).toThrow(/can not Cancle/);
	});

	it('cancels the order once the customer confirms', () => {
		const { component, warehouseOrdersRouter, dialog } = create(null);

		component.openDialog();

		expect(dialog.open).toHaveBeenCalled();
		expect(warehouseOrdersRouter.cancel).toHaveBeenCalledWith('o1');
	});
});
