/**
 * Card payments (feature inventory §4.9, fleet fixes #1645-#1654). The UI lives in
 * `components/PaymentButtons` and `modals/NewCardModal`; the rules live here so they are tested
 * without a screen:
 *
 * - one payment per order at a time, shared by every component (`ui.payingOrderIds`);
 * - a saved card is charged with 2 args, a new card with 3 (the server refuses the charge when its
 *   currency is not the one shown);
 * - every failure tells the customer a translated message, never the server text, and resolves.
 */
import { STRIPE_CURRENCY_CHANGED_ERROR } from '../domain/enums';
import type { Routers } from '../rpc/routers';
import type { AppStore } from '../store';
import { uiActions } from '../store/ui';

export const CANT_PAY_IN_APP = "Can't pay in app";

export interface PaymentDeps {
	routers: Routers;
	store: AppStore;
	/** Shows a translated message (`BUY_POPUP.PAYMENT_FAILED`, `BUY_POPUP.EMAIL_NOT_SAVED`). */
	tellCustomer: (key: 'BUY_POPUP.PAYMENT_FAILED' | 'BUY_POPUP.EMAIL_NOT_SAVED') => void;
	stripePublishableKey: string;
}

export function isPaying(store: AppStore, orderId: string | null): boolean {
	return !!orderId && store.getState().ui.payingOrderIds.includes(orderId);
}

/** Saved card (`payWithUserCard`). Resolves with the paid order, or undefined after a failure. */
export async function payWithSavedCard(
	deps: PaymentDeps,
	orderId: string,
	cardId: string | null | undefined,
) {
	if (isPaying(deps.store, orderId)) {
		return undefined;
	}
	if (!deps.stripePublishableKey) {
		throw new Error(CANT_PAY_IN_APP);
	}
	if (!cardId) {
		throw new Error('userCard is null');
	}

	deps.store.dispatch(uiActions.startPaying(orderId));
	try {
		return await deps.routers.order.payWithStripe(orderId, cardId);
	} catch (error) {
		// Declined card, an order the server refuses (paid, cancelled) or a dropped socket.
		deps.tellCustomer('BUY_POPUP.PAYMENT_FAILED');
		console.error('Payment Failed!', error);
		return undefined;
	} finally {
		deps.store.dispatch(uiActions.stopPaying(orderId));
	}
}

export interface NewCardToken {
	/** Stripe card token id (`tok_...`). */
	id: string;
	email: string;
}

export interface NewCardResult {
	paid: boolean;
	/** True when the server refused because its currency changed: reload it before the next try. */
	currencyChanged: boolean;
}

/** New card (the Stripe Checkout `token` callback): save the email, the card, charge, confirm. */
export async function payWithNewCard(
	deps: PaymentDeps,
	orderId: string,
	userId: string,
	token: NewCardToken,
	currency: string,
): Promise<NewCardResult> {
	if (isPaying(deps.store, orderId)) {
		return { paid: false, currencyChanged: false };
	}

	// Marked before the first await, so the buttons stay disabled for save, charge and confirm.
	deps.store.dispatch(uiActions.startPaying(orderId));
	try {
		let user;
		try {
			user = await deps.routers.user.updateEmail(userId, token.email);
		} catch (error) {
			// The message never says whether the email belongs to another account.
			deps.tellCustomer('BUY_POPUP.EMAIL_NOT_SAVED');
			console.error('Email update failed!', error);
			return { paid: false, currencyChanged: false };
		}

		let cardId: string;
		try {
			cardId = await deps.routers.user.addPaymentMethod(user?.id ?? userId, token.id);
		} catch (error) {
			deps.tellCustomer('BUY_POPUP.PAYMENT_FAILED');
			console.error('Payment Method creation failed!', error);
			return { paid: false, currencyChanged: false };
		}

		try {
			await deps.routers.order.payWithStripe(orderId, cardId, currency);
		} catch (error) {
			deps.tellCustomer('BUY_POPUP.PAYMENT_FAILED');
			console.error('Payment Failed!', error);
			return {
				paid: false,
				currencyChanged: (error as Error | undefined)?.name === STRIPE_CURRENCY_CHANGED_ERROR,
			};
		}

		try {
			await deps.routers.order.confirm(orderId);
		} catch (error) {
			console.error('Could not confirm the order!', error);
		}
		return { paid: true, currencyChanged: false };
	} finally {
		deps.store.dispatch(uiActions.stopPaying(orderId));
	}
}

/** `getStripeCurrency`, upper-cased; null after a failure (only logged). */
export async function loadStripeCurrency(routers: Routers): Promise<string | null> {
	try {
		const currency = await routers.order.getStripeCurrency();
		return currency ? currency.toUpperCase() : null;
	} catch (error) {
		console.error('Could not load the card charge currency!', error);
		return null;
	}
}
