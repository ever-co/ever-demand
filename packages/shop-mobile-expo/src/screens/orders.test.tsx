import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { of } from 'rxjs';
import { setStripeCurrency } from '../components/PaymentButtons';
import { overrideEnv } from '../config/env';
import { DeliveryType, OrderBarcodeTypes, OrderCarrierStatus, OrderWarehouseStatus } from '../domain/enums';
import * as fx from '../test/fixtures';
import { createMockRouters, createTestServices, customerSession, renderApp } from '../test/harness';

const withOrder = { ...customerSession, orderId: 'order-1', orderWarehouseId: 'warehouse-1' };
const carrier = { id: 'carrier-1', geoLocation: fx.sofia };

let restore: () => void = () => undefined;
beforeEach(() => setStripeCurrency(null));
afterEach(() => restore());

describe('Delivery order page (/order-info)', () => {
	it('tracks the order live: status texts, steps, elapsed time', async () => {
		const routers = createMockRouters();
		const { store } = await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers }) });

		expect(await screen.findByText("We're preparing the order!")).toBeTruthy();
		expect(screen.getByText('You will get it in 20-40 minutes.')).toBeTruthy();
		expect(screen.getByText('Prepare your wallet (10.00$ in cash).')).toBeTruthy();
		expect(screen.getByTestId('delivery-status')).toBeTruthy();
		expect(screen.getByTestId('elapsed-time')).toBeTruthy();
		expect(routers.order.get).toHaveBeenCalledWith('order-1', { populateWarehouse: true, populateCarrier: true });
		expect(routers.warehouse.get).toHaveBeenCalledWith('warehouse-1', true);
		await waitFor(() => expect(store.getState().session.startOrderDate).not.toBeNull());
	});

	it('shows the carrier step texts and a carrier → customer map', async () => {
		const routers = createMockRouters({
			order: { get: jest.fn(() => of(fx.order({ carrier, carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder }))) },
		});
		await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers }) });
		expect(await screen.findByText('Carrier on the way!')).toBeTruthy();
		expect(screen.getAllByTestId('map-marker')).toHaveLength(2);
		expect(screen.getByTestId('map-polyline')).toBeTruthy();
	});

	it('Undo → Yes cancels, refunds a paid order and goes back to the products', async () => {
		const routers = createMockRouters({
			warehouseOrders: { cancel: jest.fn(async () => fx.order({ isCancelled: true, isPaid: true })) },
		});
		const { store } = await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers }) });
		await fireEvent.press(await screen.findByTestId('undo-button'));
		expect(await screen.findByText('Are you sure?')).toBeTruthy();
		await fireEvent.press(screen.getByTestId('cancel-yes-button'));

		await waitFor(() => expect(store.getState().session.orderId).toBeNull());
		expect(routers.warehouseOrders.cancel).toHaveBeenCalledWith('order-1');
		expect(routers.order.refundWithStripe).toHaveBeenCalledWith('order-1');
		expect(await screen.findByTestId('products-screen')).toBeTruthy();
	});

	it('Undo → No keeps the order', async () => {
		const routers = createMockRouters();
		const { store } = await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers }) });
		await fireEvent.press(await screen.findByTestId('undo-button'));
		await fireEvent.press(await screen.findByTestId('cancel-no-button'));
		await waitFor(() => expect(screen.queryByTestId('cancel-modal')).toBeNull());
		expect(routers.warehouseOrders.cancel).not.toHaveBeenCalled();
		expect(store.getState().session.orderId).toBe('order-1');
	});

	it('a delivery issue opens the issue modal; OK cancels, refunds and forgets the order', async () => {
		const routers = createMockRouters({
			order: { get: jest.fn(() => of(fx.order({ isPaid: true, carrier, carrierStatus: OrderCarrierStatus.IssuesDuringDelivery }))) },
		});
		const { store } = await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers }) });
		const modal = await screen.findByTestId('issue-modal');
		expect(within(modal).getByText('The Delivery Went Wrong!')).toBeTruthy();
		await fireEvent.press(within(modal).getByTestId('issue-ok-button'));
		await waitFor(() => expect(store.getState().session.orderId).toBeNull());
		expect(routers.order.refundWithStripe).toHaveBeenCalledWith('order-1');
	});

	it('a completed order shows "Bon appetit!", which ends it', async () => {
		const routers = createMockRouters({
			order: { get: jest.fn(() => of(fx.order({ isPaid: true, carrier, carrierStatus: OrderCarrierStatus.DeliveryCompleted }))) },
		});
		const { store } = await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers }) });
		expect(await screen.findByText('Order Completed!')).toBeTruthy();
		await fireEvent.press(screen.getByText('Bon appetit!'));
		await waitFor(() => expect(store.getState().session.orderId).toBeNull());
		expect(await screen.findByTestId('products-screen')).toBeTruthy();
	});

	it('"View order products" shows the order card', async () => {
		await renderApp({ route: 'OrderInfo', session: withOrder });
		await fireEvent.press(await screen.findByTestId('view-order-products'));
		const modal = await screen.findByTestId('order-products-modal');
		expect(await within(modal).findByTestId('order-card-order-1')).toBeTruthy();
	});

	it('the guard sends a takeaway order to the takeaway page', async () => {
		await renderApp({ route: 'OrderInfo', session: { ...withOrder, deliveryType: DeliveryType.Takeaway } });
		expect(await screen.findByTestId('order-takeaway-info-screen')).toBeTruthy();
	});
});

describe('Payment', () => {
	it('saved card: "Pay with *4242" charges with 2 args', async () => {
		const routers = createMockRouters({ user: { getCards: jest.fn(async () => [{ id: 'card-9', last4: '4242' }]) } });
		await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers, env: { STRIPE_PUBLISHABLE_KEY: 'pk_test' } }) });
		await fireEvent.press(await screen.findByText('Pay with *4242'));
		await waitFor(() => expect(routers.order.payWithStripe).toHaveBeenCalledWith('order-1', 'card-9'));
	});

	it('saved card failure says PAYMENT_FAILED', async () => {
		const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		const routers = createMockRouters({
			user: { getCards: jest.fn(async () => [{ id: 'card-9', last4: '4242' }]) },
			order: { payWithStripe: jest.fn(async () => Promise.reject(new Error('declined'))) },
		});
		await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers, env: { STRIPE_PUBLISHABLE_KEY: 'pk_test' } }) });
		await fireEvent.press(await screen.findByText('Pay with *4242'));
		await waitFor(() => expect(alert).toHaveBeenCalledWith('', 'Payment failed. Please try again.'));
	});

	it('new card: the form saves the email and card, then charges in the shown currency', async () => {
		const routers = createMockRouters();
		await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers, env: { STRIPE_PUBLISHABLE_KEY: 'pk_test' } }) });
		const payNow = await screen.findByTestId('pay-now-button');
		await waitFor(() => expect(routers.order.getStripeCurrency).toHaveBeenCalled());
		await fireEvent.press(payNow);

		const form = await screen.findByTestId('new-card-modal');
		await fireEvent.changeText(within(form).getByTestId('card-email-input'), 'jane@example.com');
		await fireEvent(within(form).getByTestId('card-field'), 'cardChange', { complete: true });
		expect(within(form).getByText('Pay 10.00 USD')).toBeTruthy();
		await fireEvent.press(within(form).getByTestId('card-pay-button'));

		await waitFor(() => expect(routers.order.confirm).toHaveBeenCalledWith('order-1'));
		expect(routers.user.updateEmail).toHaveBeenCalledWith('user-1', 'jane@example.com');
		expect(routers.user.addPaymentMethod).toHaveBeenCalledWith('user-1', 'tok_test');
		expect(routers.order.payWithStripe).toHaveBeenCalledWith('order-1', 'card-1', 'USD');
		await waitFor(() => expect(screen.queryByTestId('new-card-modal')).toBeNull());
	});

	it('a paid order shows a disabled "Paid"', async () => {
		const routers = createMockRouters({ order: { get: jest.fn(() => of(fx.order({ isPaid: true }))) } });
		await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers }) });
		expect(await screen.findByTestId('paid-button')).toBeTruthy();
	});

	it('no payment buttons when the store has payments off', async () => {
		const routers = createMockRouters({ warehouse: { get: jest.fn(() => of({ ...fx.warehouse, isPaymentEnabled: false })) } });
		await renderApp({ route: 'OrderInfo', session: withOrder, services: createTestServices({ routers }) });
		await screen.findByTestId('undo-button');
		expect(screen.queryByTestId('pay-now-button')).toBeNull();
	});
});

describe('Takeaway order page (/order-info-takeaway)', () => {
	const takeaway = { ...withOrder, deliveryType: DeliveryType.Takeaway };

	it('store info with the phone, then "I\'m here" shows the QR code and order number', async () => {
		const call = jest.fn(async () => true);
		await renderApp({ route: 'OrderTakeawayInfo', session: takeaway, services: createTestServices({ call }) });
		expect(await screen.findByText('Store Info')).toBeTruthy();
		expect(screen.getByTestId('takeaway-store-name')).toHaveTextContent('Mega Pizza');
		await fireEvent.press(screen.getByTestId('takeaway-store-phone'));
		expect(call).toHaveBeenCalledWith('0888123456');

		await fireEvent.press(screen.getByTestId('im-here-button'));
		expect(await screen.findByTestId('order-qr-code')).toBeTruthy();
		expect(screen.getByTestId('order-short-id')).toHaveTextContent(/^#\d{8}-7$/);
		// "Got it!" waits for the packaging
		expect(screen.queryByTestId('got-it-button')).toBeNull();
	});

	it('"Got it!" once packaged completes the order', async () => {
		const routers = createMockRouters({
			order: { get: jest.fn(() => of(fx.order({ warehouseStatus: OrderWarehouseStatus.PackagingFinished }))) },
		});
		const { store } = await renderApp({ route: 'OrderTakeawayInfo', session: takeaway, services: createTestServices({ routers }) });
		await fireEvent.press(await screen.findByTestId('im-here-button'));
		await fireEvent.press(await screen.findByTestId('got-it-button'));
		await waitFor(() => expect(store.getState().session.orderId).toBeNull());
	});

	it('a 1-D barcode when the store uses one', async () => {
		const routers = createMockRouters({
			order: { get: jest.fn(() => of(fx.order({ warehouse: { ...fx.warehouse, orderBarcodeType: OrderBarcodeTypes.CODE128 } }))) },
		});
		await renderApp({ route: 'OrderTakeawayInfo', session: takeaway, services: createTestServices({ routers }) });
		await fireEvent.press(await screen.findByTestId('im-here-button'));
		expect(await screen.findByTestId('order-barcode')).toBeTruthy();
	});

	it('a warehouse issue opens the issue modal', async () => {
		const routers = createMockRouters({
			order: { get: jest.fn(() => of(fx.order({ warehouseStatus: OrderWarehouseStatus.AllocationFailed }))) },
		});
		await renderApp({ route: 'OrderTakeawayInfo', session: takeaway, services: createTestServices({ routers }) });
		expect(await screen.findByText('Processing Went Wrong!')).toBeTruthy();
	});
});

describe('Order popups (ORDER_INFO_TYPE=popup)', () => {
	beforeEach(() => {
		restore = overrideEnv({ ORDER_INFO_TYPE: 'popup' });
	});

	it('the feed opens the delivery popup for an open order; × keeps the order', async () => {
		const { store } = await renderApp({ route: 'Products', session: withOrder });
		const modal = await screen.findByTestId('order-modal');
		expect(within(modal).getByText("We're preparing the order!")).toBeTruthy();
		await fireEvent.press(within(modal).getByTestId('modal-close'));
		await waitFor(() => expect(screen.queryByTestId('order-modal')).toBeNull());
		expect(store.getState().session.orderId).toBe('order-1');
	});

	it('Undo → No reopens the popup', async () => {
		await renderApp({ route: 'Products', session: withOrder });
		await fireEvent.press(within(await screen.findByTestId('order-modal')).getByTestId('undo-button'));
		await fireEvent.press(await screen.findByTestId('cancel-no-button'));
		expect(await screen.findByTestId('order-modal')).toBeTruthy();
	});

	it('takeaway popup: I\'m here → QR / products toggle, Got it completes', async () => {
		const { store } = await renderApp({ route: 'Products', session: { ...withOrder, deliveryType: DeliveryType.Takeaway } });
		const modal = await screen.findByTestId('takeaway-modal');
		await fireEvent.press(within(modal).getByTestId('im-here-button'));
		expect(await screen.findByTestId('takeaway-product-image')).toBeTruthy();
		await fireEvent.press(screen.getByTestId('toggle-qr-products'));
		expect(await screen.findByTestId('order-qr-code')).toBeTruthy();
		await fireEvent.press(screen.getByTestId('got-it-button'));
		await waitFor(() => expect(store.getState().session.orderId).toBeNull());
	});

	it('takeaway popup: the address opens the map modal', async () => {
		await renderApp({ route: 'Products', session: { ...withOrder, deliveryType: DeliveryType.Takeaway } });
		await fireEvent.press(await screen.findByTestId('takeaway-store-address'));
		expect(await screen.findByTestId('map-modal')).toBeTruthy();
	});

	it('shopping cart: Buy adds to the open order and Confirm completes the cart', async () => {
		restore();
		restore = overrideEnv({ ORDER_INFO_TYPE: 'popup', SHOPPING_CART: true });
		const services = createTestServices();
		(services.graphql.getOrderWaitForCompletion as jest.Mock).mockResolvedValueOnce(true);
		await renderApp({ route: 'Products', services });
		const [buy] = await screen.findAllByTestId('buy-button');
		await fireEvent.press(buy);
		expect((services.routers.warehouseOrders.create as jest.Mock).mock.calls[0][0].waitForCompletion).toBe(true);
		const cart = await screen.findByTestId('order-products-modal');
		await fireEvent.press(within(cart).getByTestId('order-products-confirm'));
		await waitFor(() => expect(services.routers.warehouseOrders.userComplete).toHaveBeenCalledWith('order-1'));
		expect(await screen.findByTestId('order-modal')).toBeTruthy();
	});
});
