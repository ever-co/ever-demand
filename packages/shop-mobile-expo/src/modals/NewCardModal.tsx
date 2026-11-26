/**
 * New-card payment: replaces the Ionic Stripe Checkout popup. It shows the first product (title,
 * description, amount in the server's currency), asks for the email and the card, makes a Stripe
 * card token and runs the Checkout `token` handler rules (`services/payment.ts`).
 *
 * Closing it, after a payment or not, runs `close()` once: in popup mode that reopens the order
 * popup (#1651).
 */
import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { CardForm, type CardFormHandle } from '../components/CardForm';
import { getStripeCurrency, setStripeCurrency, usePaymentDeps } from '../components/PaymentButtons';
import { DeliveryType } from '../domain/enums';
import { pickTranslation } from '../domain/product';
import type { Order } from '../domain/types';
import { useLanguage } from '../hooks/useLanguage';
import { useObservable } from '../hooks/useObservable';
import { useServices } from '../services/container';
import { isPaying, loadStripeCurrency, payWithNewCard } from '../services/payment';
import { selectIsPaying, useAppDispatch, useAppSelector, useAppStore } from '../store';
import { uiActions } from '../store/ui';
import { notify } from '../utils/alert';
import { colors } from '../theme';
import { ButtonRow, ModalFrame } from './ModalFrame';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewCardModal({ orderId }: { orderId: string }) {
	const { t } = useTranslation();
	const { routers, env } = useServices();
	const store = useAppStore();
	const dispatch = useAppDispatch();
	const language = useLanguage();
	const deps = usePaymentDeps();
	const paying = useAppSelector(selectIsPaying(orderId));
	const userId = useAppSelector((state) => state.session.userId);
	const [email, setEmail] = useState('');
	const card = useRef<CardFormHandle>(null);
	const closed = useRef(false);
	// The currency shown is the one sent with the charge.
	const [currency] = useState(() => getStripeCurrency());

	const order = useObservable<Order>(() => routers.order.get(orderId, { populateWarehouse: true }), [orderId]).value;
	const first = order?.products[0];
	const amount = first ? first.price : 0;

	const close = () => {
		if (closed.current) {
			return;
		}
		closed.current = true;
		if (env.ORDER_INFO_TYPE === 'popup') {
			const delivery = store.getState().session.deliveryType === DeliveryType.Delivery;
			dispatch(uiActions.openModal({ type: delivery ? 'order' : 'takeaway' }));
		} else {
			dispatch(uiActions.closeModal());
		}
	};

	const pay = async () => {
		if (isPaying(store, orderId) || !userId || !currency) {
			return;
		}
		if (!EMAIL.test(email.trim()) || !card.current) {
			notify(t('EXPO.CARD.INCOMPLETE'));
			return;
		}
		const token = await card.current.createToken(email.trim());
		if (!token.id) {
			notify(token.error === 'incomplete' ? t('EXPO.CARD.INCOMPLETE') : t('BUY_POPUP.PAYMENT_FAILED'));
			return;
		}
		const result = await payWithNewCard(deps, orderId, userId, { id: token.id, email: email.trim() }, currency);
		if (result.currencyChanged) {
			// Pay now waits for the new currency, so no form shows the refused one again.
			setStripeCurrency(null);
			void loadStripeCurrency(routers).then((loaded) => loaded && setStripeCurrency(loaded));
		}
		close();
	};

	return (
		<ModalFrame testID='new-card-modal' onClose={close}>
			<Text style={styles.title}>{t('EXPO.CARD.TITLE')}</Text>
			{first && (
				<>
					<Text style={styles.product}>{pickTranslation(first.product.title, language, env.DEFAULT_LANGUAGE)}</Text>
					<Text style={styles.description}>
						{pickTranslation(first.product.description, language, env.DEFAULT_LANGUAGE)}
					</Text>
				</>
			)}
			<TextInput
				mode='outlined'
				label={t('EXPO.CARD.EMAIL')}
				value={email}
				onChangeText={setEmail}
				autoCapitalize='none'
				keyboardType='email-address'
				testID='card-email-input'
			/>
			<Text style={styles.description}>{t('EXPO.CARD.CARD_DETAILS')}</Text>
			{env.STRIPE_PUBLISHABLE_KEY ? (
				<CardForm ref={card} publishableKey={env.STRIPE_PUBLISHABLE_KEY} />
			) : (
				<Text style={styles.description}>{t('EXPO.CARD.NOT_AVAILABLE')}</Text>
			)}
			<ButtonRow>
				<Button
					mode='contained'
					onPress={() => void pay()}
					disabled={paying || !currency || !env.STRIPE_PUBLISHABLE_KEY}
					style={styles.flex}
					testID='card-pay-button'>
					{t('BUY_POPUP.BUTTONS.PAY_X', { amount: `${amount.toFixed(2)} ${currency ?? ''}`.trim() })}
				</Button>
			</ButtonRow>
		</ModalFrame>
	);
}

const styles = StyleSheet.create({
	title: { color: colors.light, fontSize: 18, fontWeight: 'bold' },
	product: { color: colors.light, fontWeight: 'bold' },
	description: { color: colors.medium },
	flex: { flex: 1 },
});
