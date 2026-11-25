import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeliveryType, RegistrationSystem } from '../domain/enums';
import { guardRoute, initialRoute, inviteEntry } from '../navigation/guards';
import { createAppStore } from '.';
import { hydrateSession, persistSession, SESSION_STORAGE_KEY } from './persist';
import sessionReducer, { initialSessionState, sessionActions, type SessionState } from './session';
import uiReducer, { initialUiState, uiActions } from './ui';
import { matchLanguage, resolveStartLanguage, createI18n } from '../i18n';

const session = (values: Partial<SessionState> = {}): SessionState => ({ ...initialSessionState, ...values });

describe('session slice (the Ionic localStorage keys)', () => {
	it('stores the order and clears it with its timer', () => {
		let state = sessionReducer(undefined, sessionActions.setOrder({ orderId: 'o1', warehouseId: 'w1' }));
		state = sessionReducer(state, sessionActions.startOrderTimer('2026-11-25T10:00:00Z'));
		state = sessionReducer(state, sessionActions.startOrderTimer('2026-11-25T11:00:00Z'));
		expect(state.startOrderDate).toBe('2026-11-25T10:00:00Z');
		state = sessionReducer(state, sessionActions.setEndOrderTime('05 : 00'));
		state = sessionReducer(state, sessionActions.clearOrder());
		expect(state).toMatchObject({ orderId: null, startOrderDate: null, endOrderTime: null, orderWarehouseId: 'w1' });
	});

	it('remembers a "browse first" buy and switches registration to once', () => {
		const state = sessionReducer(
			session({ registrationSystem: RegistrationSystem.Disabled }),
			sessionActions.setPendingBuy({ buyProduct: 'wp-1', warehouseId: 'w1', backToDetails: 'p-1' }),
		);
		expect(state).toMatchObject({
			registrationSystem: RegistrationSystem.Once,
			buyProduct: 'wp-1',
			warehouseId: 'w1',
			backToDetails: 'p-1',
		});
		expect(sessionReducer(state, sessionActions.clearPendingBuy())).toMatchObject({ buyProduct: null, warehouseId: null });
	});

	it('server settings, invite request, device', () => {
		let state = sessionReducer(
			undefined,
			sessionActions.setServerSettings({ inviteSystem: true, registrationSystem: RegistrationSystem.Enabled }),
		);
		state = sessionReducer(state, sessionActions.setInviteRequest({ id: 'r1', address: 'Street 1, City' }));
		state = sessionReducer(state, sessionActions.setDevice({ deviceId: 'd1', deviceUuid: 'uuid' }));
		expect(state).toMatchObject({
			inviteSystem: true,
			registrationSystem: 'enabled',
			inviteRequestId: 'r1',
			inviteAddress: 'Street 1, City',
			deviceId: 'd1',
		});
	});
});

describe('ui slice', () => {
	it('keeps the paying orders in memory and one modal at a time', () => {
		let state = uiReducer(initialUiState, uiActions.startPaying('o1'));
		state = uiReducer(state, uiActions.startPaying('o1'));
		expect(state.payingOrderIds).toEqual(['o1']);
		state = uiReducer(state, uiActions.stopPaying('o1'));
		expect(state.payingOrderIds).toEqual([]);
		state = uiReducer(state, uiActions.openModal({ type: 'cancel' }));
		state = uiReducer(state, uiActions.openModal({ type: 'order' }));
		expect(state.modal).toEqual({ type: 'order' });
		expect(uiReducer(state, uiActions.closeModal()).modal).toBeNull();
	});
});

describe('persistence', () => {
	beforeEach(() => AsyncStorage.clear());

	it('writes the session on change and loads it back, but never the paying orders', async () => {
		const store = createAppStore();
		const stop = persistSession(store);
		store.dispatch(sessionActions.setUserId('user-1'));
		store.dispatch(uiActions.startPaying('o1'));
		await new Promise((resolve) => setTimeout(resolve, 0));
		stop();

		const saved = JSON.parse((await AsyncStorage.getItem(SESSION_STORAGE_KEY))!);
		expect(saved.userId).toBe('user-1');
		expect(saved.payingOrderIds).toBeUndefined();

		const next = createAppStore();
		await hydrateSession(next);
		expect(next.getState().session.userId).toBe('user-1');
		expect(next.getState().ui.payingOrderIds).toEqual([]);
	});
});

describe('route guards', () => {
	it('start route: maintenance, server down, invite entry', () => {
		expect(initialRoute(session({ maintenanceMode: 'api' }))).toBe('Maintenance');
		expect(initialRoute(session({ serverConnection: 0 }))).toBe('ServerDown');
		expect(initialRoute(session({ inviteSystem: true }))).toBe('InviteByCode');
		expect(initialRoute(session({ inviteSystem: false }))).toBe('InviteByLocation');
		expect(initialRoute(session({ userId: 'u' }))).toBe('Products');
		expect(inviteEntry(session({ registrationSystem: RegistrationSystem.Disabled }))).toBe('Products');
	});

	it('invite pages', () => {
		expect(guardRoute('InviteByCode', session({ userId: 'u' }))).toBe('Products');
		expect(guardRoute('InviteByCode', session({ inviteSystem: false }))).toBe('InviteByLocation');
		expect(guardRoute('InviteByCode', session({ inviteSystem: true }))).toBeNull();
		expect(guardRoute('InviteByLocation', session({ inviteSystem: true, inviteRequestId: 'r' }))).toBe('InviteByCode');
		expect(guardRoute('InviteByLocation', session({ inviteSystem: true }))).toBeNull();
		expect(guardRoute('InviteByLocation', session({ registrationSystem: RegistrationSystem.Disabled }))).toBe('Products');
	});

	it('pages that need a customer', () => {
		const visitor = session({ registrationSystem: RegistrationSystem.Enabled, inviteSystem: true });
		expect(guardRoute('Products', visitor)).toBe('InviteByCode');
		expect(guardRoute('Products', session({ registrationSystem: RegistrationSystem.Disabled }))).toBeNull();
		expect(guardRoute('Merchants', visitor)).toBe('InviteByCode');
		expect(guardRoute('About', visitor)).toBe('InviteByCode');
		expect(guardRoute('OrdersHistory', session({ inviteSystem: false }))).toBe('InviteByLocation');
		expect(guardRoute('OrdersHistory', session({ userId: 'u' }))).toBeNull();
		expect(guardRoute('Language', visitor)).toBeNull();
	});

	it('order pages follow the delivery type', () => {
		const customer = session({ userId: 'u' });
		expect(guardRoute('OrderInfo', { ...customer, deliveryType: DeliveryType.Takeaway })).toBe('OrderTakeawayInfo');
		expect(guardRoute('OrderTakeawayInfo', { ...customer, deliveryType: DeliveryType.Delivery })).toBe('OrderInfo');
		expect(guardRoute('OrderInfo', customer)).toBeNull();
		expect(guardRoute('OrderInfo', session({ inviteSystem: true }))).toBe('InviteByCode');
	});

	it('maintenance and server down win over every page', () => {
		expect(guardRoute('Products', session({ userId: 'u', maintenanceMode: 'shop-mobile' }))).toBe('Maintenance');
		expect(guardRoute('Products', session({ userId: 'u', serverConnection: 0 }))).toBe('ServerDown');
		expect(guardRoute('Maintenance', session({ userId: 'u' }))).toBe('Products');
		expect(guardRoute('Maintenance', session({ maintenanceMode: 'api' }))).toBeNull();
	});
});

describe('i18n', () => {
	it('start language: stored, else DEFAULT_LANGUAGE, else device, else en-US', () => {
		expect(resolveStartLanguage('he-IL', 'en-US', 'fr-FR')).toBe('he-IL');
		expect(resolveStartLanguage(null, '', 'ru')).toBe('ru-RU');
		expect(resolveStartLanguage(null, 'bg-BG', 'fr-FR')).toBe('bg-BG');
		expect(resolveStartLanguage('xx', '', 'de-DE')).toBe('en-US');
		expect(matchLanguage('es-MX')).toBe('es-ES');
	});

	it('reads the Ionic files, arrays by index, with an en-US fallback', () => {
		const i18n = createI18n('he-IL');
		expect(i18n.t('CURRENT_DIRECTION')).toBe('rtl');
		expect(i18n.t('BUY_POPUP.STATUSES.0.TITLE')).not.toBe('BUY_POPUP.STATUSES.0.TITLE');
		expect(i18n.t('EXPO.CARD.EMAIL')).toBe('Email');
		void i18n.changeLanguage('en-US');
		expect(i18n.t('BUY_POPUP.UNDO_POPUP.DETAILS.1')).toBe('lose');
		expect(i18n.t('BUY_POPUP.BUTTONS.PAY_X', { amount: '10 USD' })).toBe('Pay 10 USD');
	});
});
