import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { of } from 'rxjs';
import { overrideEnv } from '../config/env';
import { DeliveryType, RegistrationSystem } from '../domain/enums';
import * as fx from '../test/fixtures';
import { createMockGraphQL, createMockRouters, createTestServices, customerSession, renderApp } from '../test/harness';

describe('Product feed', () => {
	let restore: () => void = () => undefined;
	afterEach(() => restore());

	it('loads the count, then a page of 10 with the Ionic options (slides view)', async () => {
		const graphql = createMockGraphQL();
		await renderApp({ route: 'Products', services: createTestServices({ graphql }) });

		expect(await screen.findAllByTestId('product-slide')).toHaveLength(2);
		const options = {
			isDeliveryRequired: true,
			isTakeaway: false,
			merchantIds: [],
			imageOrientation: 1,
			locale: 'en-US',
			withoutCount: true,
		};
		const geo = { loc: { type: 'Point', coordinates: [23.3332736, 42.6459136] } };
		expect(graphql.countGeoLocationProducts).toHaveBeenCalledWith(geo, options);
		expect(graphql.watchGeoLocationProducts).toHaveBeenCalledWith(geo, { skip: 0, limit: 10 }, options);
		expect(screen.getAllByText('Buy for 10$')).toHaveLength(2);
		expect(screen.getAllByTestId('discount-badge')).toHaveLength(2); // 10 of 12 → 16%
		expect(screen.getAllByText('16%', { exact: false }).length).toBeGreaterThan(0);
	});

	it('list view uses image orientation 0 and shows the cards', async () => {
		restore = overrideEnv({ PRODUCTS_VIEW_TYPE: 'list' });
		const graphql = createMockGraphQL();
		await renderApp({ route: 'Products', services: createTestServices({ graphql }) });
		expect(await screen.findByTestId('products-list')).toBeTruthy();
		await waitFor(() => expect(screen.getByTestId('product-card-wp-1')).toBeTruthy());
		expect((graphql.watchGeoLocationProducts as jest.Mock).mock.calls[0][2].imageOrientation).toBe(0);
	});

	it('hides products with count 0', async () => {
		const graphql = createMockGraphQL({
			watchGeoLocationProducts: jest.fn(() => of([fx.productInfo('1'), fx.productInfo('2', { count: 0 })])),
		});
		await renderApp({ route: 'Products', services: createTestServices({ graphql }) });
		expect(await screen.findAllByTestId('product-slide')).toHaveLength(1);
	});

	it('Buy creates the order and opens the delivery order page (page mode)', async () => {
		const routers = createMockRouters();
		const { store } = await renderApp({ route: 'Products', services: createTestServices({ routers }) });
		const [first] = await screen.findAllByTestId('buy-button');
		await fireEvent.press(first);

		await waitFor(() => expect(store.getState().session.orderId).toBe('order-1'));
		expect(routers.warehouseOrders.create).toHaveBeenCalledWith({
			warehouseId: 'warehouse-1',
			products: [{ count: 1, productId: 'product-1' }],
			userId: 'user-1',
			orderType: DeliveryType.Delivery,
			waitForCompletion: false,
			options: { autoConfirm: true },
		});
		expect(await screen.findByTestId('order-info-screen')).toBeTruthy();
	});

	it('Buy in popup mode opens the order popup instead', async () => {
		restore = overrideEnv({ ORDER_INFO_TYPE: 'popup' });
		await renderApp({ route: 'Products' });
		const [first] = await screen.findAllByTestId('buy-button');
		await fireEvent.press(first);
		expect(await screen.findByTestId('order-modal')).toBeTruthy();
	});

	it('a refused Buy marks the product as not available', async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		const routers = createMockRouters({ warehouseOrders: { create: jest.fn(async () => Promise.reject(new Error('sold out'))) } });
		await renderApp({ route: 'Products', services: createTestServices({ routers }) });
		const [first] = await screen.findAllByTestId('buy-button');
		await fireEvent.press(first);
		expect(await screen.findByText('Product not available')).toBeTruthy();
	});

	it('"browse first": Buy without a user remembers the product and opens the invite', async () => {
		const { store } = await renderApp({
			route: 'Products',
			session: { inviteSystem: true, registrationSystem: RegistrationSystem.Disabled, language: 'en-US', serverConnection: 200 },
		});
		const [first] = await screen.findAllByTestId('buy-button');
		await fireEvent.press(first);
		expect(await screen.findByTestId('invite-by-code-screen')).toBeTruthy();
		expect(store.getState().session).toMatchObject({ registrationSystem: 'once', buyProduct: 'wp-1', warehouseId: 'warehouse-1' });
	});

	it('resumes the remembered Buy after the invite', async () => {
		const routers = createMockRouters();
		await renderApp({
			route: 'Products',
			session: { ...customerSession, buyProduct: 'wp-1', warehouseId: 'warehouse-1', registrationSystem: RegistrationSystem.Once },
			services: createTestServices({ routers }),
		});
		await waitFor(() => expect(routers.warehouseOrders.create).toHaveBeenCalled());
		expect(await screen.findByTestId('order-info-screen')).toBeTruthy();
	});

	it('Details checks the product still exists, then opens it', async () => {
		const graphql = createMockGraphQL();
		await renderApp({ route: 'Products', services: createTestServices({ graphql }) });
		const [first] = await screen.findAllByTestId('details-button');
		await fireEvent.press(first);
		expect(graphql.getWarehouseProduct).toHaveBeenCalledWith('warehouse-1', 'wp-1');
		expect(await screen.findByTestId('product-details-screen')).toBeTruthy();
	});

	it('the Takeaway / Delivery toggle reloads the feed for the other purchase type', async () => {
		const graphql = createMockGraphQL();
		const { store } = await renderApp({ route: 'Products', services: createTestServices({ graphql }) });
		await screen.findAllByTestId('product-slide');
		await fireEvent.press(screen.getByText('Takeout'));
		await waitFor(() => expect(store.getState().session.deliveryType).toBe(DeliveryType.Takeaway));
		await waitFor(() =>
			expect(graphql.countGeoLocationProducts).toHaveBeenLastCalledWith(
				expect.anything(),
				expect.objectContaining({ isDeliveryRequired: false, isTakeaway: true }),
			),
		);
	});

	it('in store mode: takeaway only, the merchant name in the header, the feed limited to it', async () => {
		const graphql = createMockGraphQL();
		const { store } = await renderApp({
			route: 'Products',
			session: { ...customerSession, inStore: 'warehouse-1' },
			services: createTestServices({ graphql }),
		});
		expect(await screen.findByText('Mega Pizza Products')).toBeTruthy();
		expect(screen.queryByTestId('delivery-type-toggle')).toBeNull();
		await waitFor(() => expect(store.getState().session.deliveryType).toBe(DeliveryType.Takeaway));
		await waitFor(() =>
			expect(graphql.countGeoLocationProducts).toHaveBeenLastCalledWith(
				expect.anything(),
				expect.objectContaining({ merchantIds: ['warehouse-1'], isTakeaway: true }),
			),
		);
		await fireEvent.press(screen.getByTestId('store-sign'));
		await waitFor(() => expect(store.getState().session.inStore).toBeNull());
	});

	it('the store sign opens the merchants (no MERCHANT_IDS)', async () => {
		await renderApp({ route: 'Products' });
		await fireEvent.press(await screen.findByTestId('store-sign'));
		expect(await screen.findByTestId('merchants-screen')).toBeTruthy();
	});

	it('with an open order: the order sign with its total, no toggle or search', async () => {
		await renderApp({ route: 'Products', session: { ...customerSession, orderId: 'order-1', orderWarehouseId: 'warehouse-1' } });
		const sign = await screen.findByTestId('order-sign');
		await waitFor(() => expect(within(sign).getByText('10$')).toBeTruthy());
		expect(screen.queryByTestId('search-toggle')).toBeNull();
		await fireEvent.press(sign);
		expect(await screen.findByTestId('order-info-screen')).toBeTruthy();
	});

	it('shows the server placeholder when the feed is empty', async () => {
		const graphql = createMockGraphQL({ countGeoLocationProducts: jest.fn(async () => 0) });
		const routers = createMockRouters({ userProducts: { getPlaceholder: jest.fn(() => of('<b>Nothing near you yet</b>')) } });
		await renderApp({ route: 'Products', services: createTestServices({ graphql, routers }) });
		expect(await screen.findByText('Nothing near you yet')).toBeTruthy();
	});

	it('search finds merchants and products', async () => {
		const graphql = createMockGraphQL();
		await renderApp({ route: 'Products', services: createTestServices({ graphql }) });
		await fireEvent.press(await screen.findByTestId('search-toggle'));
		await fireEvent.changeText(await screen.findByTestId('search-input'), 'piz');
		expect(await screen.findByTestId('search-merchant-warehouse-1', {}, { timeout: 3000 })).toBeTruthy();
		await waitFor(() =>
			expect(graphql.getMerchantsByName).toHaveBeenLastCalledWith('piz', expect.objectContaining({ loc: expect.anything() })),
		);
		expect(graphql.geoLocationProducts).toHaveBeenLastCalledWith(
			expect.anything(),
			{ limit: 10, skip: 0 },
			{ isDeliveryRequired: true, isTakeaway: false },
			'piz',
		);
		expect(screen.getByText('Open')).toBeTruthy();
	});

	it('without a location it falls back to a one-time invite', async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		const services = createTestServices({
			location: { getCurrentCoords: jest.fn(async () => Promise.reject(new Error("Can't detect location"))) },
		});
		const { store } = await renderApp({
			route: 'Products',
			session: { inviteSystem: true, registrationSystem: RegistrationSystem.Disabled, language: 'en-US', serverConnection: 200 },
			services,
		});
		expect(await screen.findByTestId('invite-by-code-screen')).toBeTruthy();
		expect(store.getState().session.registrationSystem).toBe('once');
	});
});

describe('Product details', () => {
	it('shows the product of the warehouse and buys it', async () => {
		const routers = createMockRouters();
		const { store } = await renderApp({
			route: 'Products',
			services: createTestServices({ routers }),
		});
		const [details] = await screen.findAllByTestId('details-button');
		await fireEvent.press(details);
		expect(await screen.findByTestId('product-details-title')).toHaveTextContent('Pizza 1');
		expect(screen.getByText('Details of Pizza 1')).toBeTruthy();
		expect(routers.warehouse.get).toHaveBeenCalledWith('warehouse-1', true);
		expect(routers.warehouseProducts.get).toHaveBeenCalledWith('warehouse-1', false);

		await fireEvent.press(screen.getByTestId('details-buy-button'));
		await waitFor(() => expect(store.getState().session.orderId).toBe('order-1'));
		expect((routers.warehouseOrders.create as jest.Mock).mock.calls[0][0]).toMatchObject({
			warehouseId: 'warehouse-1',
			products: [{ count: 1, productId: 'product-1' }],
		});
	});

	it('is sold out when the store no longer has the product', async () => {
		const routers = createMockRouters({ warehouseProducts: { get: jest.fn(() => of([])) } });
		await renderApp({ route: 'Products', services: createTestServices({ routers }) });
		const [details] = await screen.findAllByTestId('details-button');
		await fireEvent.press(details);
		expect(await screen.findByText('Product not available')).toBeTruthy();
	});
});

