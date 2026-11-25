/** The Ionic `e-cu-payment` component (feature inventory §4.9). */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { Order, StripeCard } from '../domain/types';
import { useServices } from '../services/container';
import { loadStripeCurrency, payWithSavedCard, type PaymentDeps } from '../services/payment';
import { selectIsPaying, useAppDispatch, useAppSelector, useAppStore } from '../store';
import { uiActions } from '../store/ui';
import { notify } from '../utils/alert';
import { colors } from '../theme';

/** Currency of the card charges, shared by every payment component and the card form. */
let sharedCurrency: string | null = null;
const currencyListeners = new Set<(currency: string | null) => void>();

export function setStripeCurrency(currency: string | null) {
	sharedCurrency = currency;
	currencyListeners.forEach((listener) => listener(currency));
}

export function getStripeCurrency(): string | null {
	return sharedCurrency;
}

export function usePaymentDeps(): PaymentDeps {
	const { routers, env } = useServices();
	const store = useAppStore();
	const { t } = useTranslation();
	return {
		routers,
		store,
		stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY,
		tellCustomer: (key) => notify(t(key)),
	};
}

export function PaymentButtons({ order, small = false }: { order: Order; small?: boolean }) {
	const { t } = useTranslation();
	const { routers, env } = useServices();
	const dispatch = useAppDispatch();
	const deps = usePaymentDeps();
	const userId = useAppSelector((state) => state.session.userId);
	const orderId = useAppSelector((state) => state.session.orderId);
	const paying = useAppSelector(selectIsPaying(orderId));
	const [userCard, setUserCard] = useState<StripeCard | null>(null);
	const [currency, setCurrency] = useState<string | null>(sharedCurrency);
	const [loadingCurrency, setLoadingCurrency] = useState(false);

	const reloadCurrency = useCallback(async () => {
		setLoadingCurrency(true);
		const loaded = await loadStripeCurrency(routers);
		if (loaded) {
			setStripeCurrency(loaded);
		}
		setLoadingCurrency(false);
	}, [routers]);

	useEffect(() => {
		currencyListeners.add(setCurrency);
		return () => {
			currencyListeners.delete(setCurrency);
		};
	}, []);

	useEffect(() => {
		let active = true;
		if (userId) {
			routers.user
				.getCards(userId)
				.then((cards) => active && setUserCard(cards?.[0] ?? null))
				.catch((error) => console.warn('Could not load the saved cards', error));
		}
		// Never rejects: a failed load is logged, and Pay now loads it again.
		void reloadCurrency();
		return () => {
			active = false;
		};
	}, [reloadCurrency, routers, userId]);

	const waitingForCurrency = currency == null && loadingCurrency;

	const payWithUserCard = () => {
		if (!orderId) {
			return;
		}
		payWithSavedCard(deps, orderId, userCard?.id).catch((error) => console.error(error));
	};

	/** The new-card form must open straight from the tap, so it never waits on the network. */
	const toPaymentStage = () => {
		if (!orderId || paying) {
			return;
		}
		if (!env.STRIPE_PUBLISHABLE_KEY) {
			console.error("Can't pay in app");
			return;
		}
		if (currency == null) {
			if (!loadingCurrency) {
				notify(t('BUY_POPUP.PAYMENT_FAILED'));
				void reloadCurrency();
			}
			return;
		}
		dispatch(uiActions.openModal({ type: 'newCard', orderId }));
	};

	if (order.isPaid) {
		return (
			<Button mode='contained' disabled style={styles.button} testID='paid-button'>
				{t('BUY_POPUP.BUTTONS.PAID')}
			</Button>
		);
	}

	if (userCard) {
		return (
			<Button
				mode='contained'
				disabled={paying}
				onPress={payWithUserCard}
				style={styles.button}
				compact={small}
				icon={() => <MaterialCommunityIcons name='credit-card' size={16} color={colors.white} />}
				testID='pay-saved-card-button'>
				{`${t('BUY_POPUP.BUTTONS.PAY_WITH_FIXED_CARD')} *${userCard.last4}`}
			</Button>
		);
	}

	return (
		<View style={styles.wrap}>
			<Button
				mode='contained'
				disabled={paying || waitingForCurrency}
				onPress={toPaymentStage}
				style={styles.button}
				compact={small}
				testID='pay-now-button'>
				{t('BUY_POPUP.BUTTONS.PAY_NOW')}
			</Button>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { flex: 1 },
	button: { flex: 1 },
});
