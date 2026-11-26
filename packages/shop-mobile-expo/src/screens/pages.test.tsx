import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { of } from 'rxjs';
import { OrderStatus } from '../domain/enums';
import { ORDER_DETAILS, ORDERS_HISTORY } from '../graphql/documents';
import * as fx from '../test/fixtures';
import { createMockGraphQL, createMockRouters, createTestServices, customerSession, renderApp, visitorSession } from '../test/harness';

/** An order history row as the GraphQL fragment returns it. */
function historyOrder(id: string, products = 1, status: OrderStatus = OrderStatus.Delivered) {
	return {
		__typename: 'Order',
		id,
		deliveryTime: '2026-11-25T10:30:00.000Z',
		warehouseId: 'warehouse-1',
		createdAt: '2026-11-25T10:00:00.000Z',
		status,
		user: {
			__typename: 'User',
			id: 'user-1',
			geoLocation: {
				__typename: 'GeoLocation',
				countryName: 'Bulgaria',
				countryId: 21,
				streetAddress: 'Simeonovsko shose',
				house: '104',
				postcode: '1700',
				city: 'Sofia',
			},
		},
		warehouse: { __typename: 'Warehouse', id: 'warehouse-1', logo: 'logo.png' },
		products: Array.from({ length: products }, (_, i) => ({
			__typename: 'OrderProduct',
			count: 1,
			price: 5,
			isTakeaway: false,
			product: {
				__typename: 'Product',
				images: [{ __typename: 'ImageType', locale: 'en-US', orientation: 1, url: `img${i}.png` }],
				title: [{ __typename: 'TranslateType', locale: 'en-US', value: `Dish ${i}` }],
				description: [{ __typename: 'TranslateType', locale: 'en-US', value: 'Good' }],
			},
		})),
	};
}

describe('Orders history', () => {
	it('lists the orders as cards with at most 3 products, then "N more" opens the details', async () => {
		const services = createTestServices({
			mocks: [
				{ request: { query: ORDERS_HISTORY, variables: { userId: 'user-1' } }, result: { data: { getOrders: [historyOrder('o1', 5)] } } },
				{ request: { query: ORDER_DETAILS, variables: { id: 'o1' } }, result: { data: { getOrder: historyOrder('o1', 5) } } },
			],
		});
		await renderApp({ route: 'OrdersHistory', services });

		const card = await screen.findByTestId('order-card-o1');
		expect(within(card).getByTestId('order-total')).toHaveTextContent('$25');
		expect(within(card).getByText('To: Bulgaria 1700, Sofia')).toBeTruthy();
		expect(within(card).getByTestId('order-status-badge')).toHaveTextContent('Delivered');
		expect(within(card).getByTestId('order-state')).toHaveTextContent('30:00 min');
		expect(within(card).getAllByText(/^Dish/)).toHaveLength(3);
		await fireEvent.press(within(card).getByTestId('order-card-more'));

		const details = await screen.findByTestId('order-details-screen');
		await waitFor(() => expect(within(details).getAllByText(/^Dish/)).toHaveLength(5));
	});

	it('empty history: "No orders yet" and a way back to the products', async () => {
		const services = createTestServices({
			mocks: [{ request: { query: ORDERS_HISTORY, variables: { userId: 'user-1' } }, result: { data: { getOrders: [] } } }],
		});
		await renderApp({ route: 'OrdersHistory', services });
		expect(await screen.findByText('No orders yet')).toBeTruthy();
		await fireEvent.press(screen.getByTestId('to-products-button'));
		expect(await screen.findByTestId('products-screen')).toBeTruthy();
	});

	it('an order in progress shows Pending and opens its tracking page', async () => {
		const services = createTestServices({
			mocks: [
				{
					request: { query: ORDERS_HISTORY, variables: { userId: 'user-1' } },
					result: { data: { getOrders: [{ ...historyOrder('o2', 1, OrderStatus.WarehousePreparation), deliveryTime: null }] } },
				},
			],
		});
		await renderApp({ route: 'OrdersHistory', session: { ...customerSession, orderId: 'order-1', orderWarehouseId: 'warehouse-1' }, services });
		const card = await screen.findByTestId('order-card-o2');
		expect(within(card).getByTestId('order-state')).toHaveTextContent('Pending');
		await fireEvent.press(within(card).getByText(/^Dish 0/));
		expect(await screen.findByTestId('order-info-screen')).toBeTruthy();
	});

	it('needs a customer', async () => {
		await renderApp({ route: 'OrdersHistory', session: visitorSession });
		expect(await screen.findByTestId('invite-by-code-screen')).toBeTruthy();
	});
});

describe('Merchants', () => {
	it('lists the close merchants, searches by name and enters a store', async () => {
		const graphql = createMockGraphQL();
		const { store } = await renderApp({ route: 'Merchants', services: createTestServices({ graphql }) });
		expect(await screen.findByText('Merchants close to you')).toBeTruthy();
		expect(await screen.findByTestId('merchant-warehouse-1')).toBeTruthy();
		expect(graphql.getCloseMerchants).toHaveBeenCalledWith({ loc: { type: 'Point', coordinates: [23.3332736, 42.6459136] } });

		await fireEvent.changeText(screen.getByTestId('merchants-search'), 'Mega');
		await waitFor(() => expect(graphql.getMerchantsByName).toHaveBeenCalledWith('Mega', expect.anything()));
		expect(screen.getByText("Merchants with name 'Mega'")).toBeTruthy();

		await fireEvent.press(screen.getByTestId('merchant-warehouse-1'));
		await waitFor(() => expect(store.getState().session.inStore).toBe('warehouse-1'));
		expect(await screen.findByTestId('products-screen')).toBeTruthy();
	});

	it('"Not Found!" when there are none', async () => {
		const graphql = createMockGraphQL({ getCloseMerchants: jest.fn(async () => []) });
		await renderApp({ route: 'Merchants', services: createTestServices({ graphql }) });
		expect(await screen.findByTestId('merchants-not-found')).toBeTruthy();
	});

	it('Scan opens the scanner', async () => {
		await renderApp({ route: 'Merchants' });
		await fireEvent.press(await screen.findByTestId('merchants-scan'));
		expect(await screen.findByTestId('qr-scanner')).toBeTruthy();
	});
});

describe('Language', () => {
	it('switches the texts and remembers the choice', async () => {
		const { store } = await renderApp({ route: 'Language' });
		expect(await screen.findByText('Select Language')).toBeTruthy();
		await fireEvent.press(screen.getByTestId('language-bg-BG'));
		await waitFor(() => expect(store.getState().session.language).toBe('bg-BG'));
		// Back to the products, now in Bulgarian.
		expect(await screen.findByTestId('products-screen')).toBeTruthy();
		await fireEvent.press(screen.getByTestId('menu-button'));
		expect(await screen.findByText('Език', { exact: false })).toBeTruthy();
	});

	it('Hebrew puts the app in right-to-left mode', async () => {
		const { store } = await renderApp({ route: 'Language' });
		await fireEvent.press(await screen.findByTestId('language-he-IL'));
		await waitFor(() => expect(store.getState().session.language).toBe('he-IL'));
	});
});

describe('Info pages', () => {
	it.each([
		['About', 'getAboutUs', 'About Ever'],
		['Help', 'getHelp', 'Help'],
		['Privacy', 'getPrivacy', 'Privacy'],
		['TermsOfUse', 'getTermsOfUse', 'Terms'],
	] as const)('%s shows the server HTML', async (route, method, text) => {
		const routers = createMockRouters();
		await renderApp({ route, services: createTestServices({ routers }) });
		expect(await screen.findByTestId('webview-html')).toHaveTextContent(text);
		expect(routers.user[method]).toHaveBeenCalledWith('user-1', 'device-1', 'en-US');
	});
});

describe('Connection, server and maintenance pages', () => {
	it('connection lost', async () => {
		await renderApp({ route: 'ConnectionLost' });
		expect(await screen.findByText('No connection to Ever')).toBeTruthy();
	});

	it('server down checks again and leaves when the server is back', async () => {
		jest.useFakeTimers();
		const { store } = await renderApp({ route: 'ServerDown', session: { ...customerSession, serverConnection: 0 } });
		expect(await screen.findByText('Server connection is lost')).toBeTruthy();
		jest.advanceTimersByTime(5000);
		jest.useRealTimers();
		await waitFor(() => expect(store.getState().session.serverConnection).toBe(200));
		expect(await screen.findByTestId('products-screen')).toBeTruthy();
	});

	it('maintenance shows the message', async () => {
		const fetchMock = jest.fn(async () => ({
			ok: true,
			status: 200,
			json: async () => ({ maintenance: [{ type: 'shop-mobile', status: true, message: 'Back at 10:00' }, { type: 'api', status: true, message: '' }] }),
		})) as unknown as typeof fetch;
		await renderApp({
			route: 'Maintenance',
			session: { ...customerSession, maintenanceMode: 'shop-mobile' },
			services: createTestServices({ fetch: fetchMock, env: { SETTINGS_MAINTENANCE_API_URL: 'https://settings/maintenance' } }),
		});
		expect(await screen.findByTestId('maintenance-message')).toHaveTextContent('Back at 10:00');
	});
});

describe('Side menu', () => {
	it('opens from the header and navigates', async () => {
		await renderApp({ route: 'Products' });
		await fireEvent.press(await screen.findByTestId('menu-button'));
		const menu = await screen.findByTestId('side-menu');
		expect(within(menu).getByText('Order history')).toBeTruthy();
		expect(within(menu).getByText('Language')).toBeTruthy();
		expect(within(menu).getByText('Privacy')).toBeTruthy();
		await fireEvent.press(within(menu).getByTestId('menu-Language'));
		expect(await screen.findByTestId('language-screen')).toBeTruthy();
	});

	it('"Call us" dials the support number; a failed call shows the apology', async () => {
		const call = jest.fn(async () => false);
		await renderApp({ route: 'Products', services: createTestServices({ call }) });
		await fireEvent.press(await screen.findByTestId('menu-button'));
		await fireEvent.press(await screen.findByTestId('menu-CallUs'));
		expect(call).toHaveBeenCalledWith('0888888888');
		expect(await screen.findByText('Call Was Unsuccessful!')).toBeTruthy();
	});
});

describe('Live order data comes from the pyro routers', () => {
	it('uses the order of the session', async () => {
		const routers = createMockRouters({ order: { get: jest.fn(() => of(fx.order({ id: 'order-7' }))) } });
		await renderApp({ route: 'OrderInfo', session: { ...customerSession, orderId: 'order-7' }, services: createTestServices({ routers }) });
		await screen.findByTestId('order-info-screen');
		expect(routers.order.get).toHaveBeenCalledWith('order-7', expect.anything());
	});
});
