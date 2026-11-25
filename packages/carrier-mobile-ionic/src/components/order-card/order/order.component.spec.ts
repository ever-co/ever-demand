import OrderStatus from '@modules/server.common/enums/OrderStatus';
import { OrderComponent } from './order.component';
// gives the AOT test build the template scope of the component
import './order.module';

describe('OrderComponent', () => {
	const order = (overrides: Record<string, any> = {}) =>
		({
			id: 'o1',
			status: OrderStatus.Delivered,
			_createdAt: '2026-11-25T10:00:00.000Z',
			deliveryTime: '2026-11-25T10:31:05.000Z',
			user: {
				_id: 'u1',
				firstName: 'Ana',
				lastName: 'Ivanova',
				image: '',
				geoLocation: {
					countryId: 21,
					postcode: '1000',
					city: 'Sofia',
					notes: null,
				},
			},
			warehouse: {
				logo: 'logo.png',
				name: 'Store',
				geoLocation: { countryId: 21, postcode: '1000', city: 'Sofia' },
			},
			products: [
				{ count: 2, price: 3.5 },
				{ count: 1, price: 10 },
				{ count: 4, price: 1 },
				{ count: 1, price: 1 },
			],
			...overrides,
		}) as any;

	const create = (o = order(), max = 3) => {
		const component = new OrderComponent(
			{ carrierId: 'c1', language: 'en-US' } as any,
			{} as any
		);
		component.order = o;
		component.productsMaxAmountToShow = max;
		component.ngOnInit();
		return component;
	};

	it('sums the products into the total price', () => {
		expect(create().totalPrice).toBe(22);
	});

	it('shows the customer name, or the id when the name is missing', () => {
		expect(create().customerBasicInfo).toBe('Ana Ivanova');
		expect(
			create(order({ user: { ...order().user, lastName: '' } }))
				.customerBasicInfo
		).toBe('u1');
	});

	it('formats the customer notes and the delivery time', () => {
		const c = create();
		expect(c.customerNotes).toBe('Notes: ');
		expect(c.deliveryTime).toBe('31:05 min');
		expect(c.customerLogo).toBe(c.customerDefaultLogo);
	});

	it('colours the badge by order status', () => {
		expect(create().badgeClass).toBe('badge-balanced');
		expect(
			create(order({ status: OrderStatus.CarrierIssue })).badgeClass
		).toBe('badge-assertive');
		expect(
			create(order({ status: OrderStatus.CanceledWhileInDelivery }))
				.badgeClass
		).toBe('badge-energized');
	});

	it('shows the first products and toggles the rest', () => {
		const c = create();
		expect(c.orderProductsToShow.length).toBe(3);
		expect(c.showMoreIcon).toBe(true);

		c.toggleOrderProducts();
		expect(c.orderProductsToShow.length).toBe(4);

		c.toggleOrderProducts();
		expect(c.orderProductsToShow.length).toBe(3);
	});
});
