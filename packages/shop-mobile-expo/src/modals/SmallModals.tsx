/** Cancel ("Undo"), issue, "call unsuccessful" and map modals (§4.10, §4.11, §4.12, §4.8). */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { OrderMap } from '../components/OrderMap';
import { mapPoints } from '../components/OrderMap.types';
import { IssueTexts } from '../components/OrderTracking';
import { DeliveryType } from '../domain/enums';
import type { Coordinates } from '../domain/types';
import { navigateRoot } from '../navigation/actions';
import { useServices } from '../services/container';
import { cancelOpenOrder, closeIssue } from '../services/orders';
import { useAppDispatch, useAppStore } from '../store';
import { uiActions } from '../store/ui';
import { colors } from '../theme';
import { ButtonRow, ModalFrame } from './ModalFrame';

export function CancelModal() {
	const { t } = useTranslation();
	const { routers, env } = useServices();
	const store = useAppStore();
	const dispatch = useAppDispatch();
	const [busy, setBusy] = useState(false);

	const yes = async () => {
		setBusy(true);
		try {
			await cancelOpenOrder({ routers, store });
		} catch (error) {
			console.warn('Could not cancel the order', error);
		}
		dispatch(uiActions.closeModal());
		if (env.ORDER_INFO_TYPE === 'page') {
			navigateRoot('Products');
		}
	};

	/** Back: popup mode reopens the order popup; page mode closes. */
	const no = () => {
		if (env.ORDER_INFO_TYPE === 'popup') {
			const delivery = store.getState().session.deliveryType === DeliveryType.Delivery;
			dispatch(uiActions.openModal({ type: delivery ? 'order' : 'takeaway' }));
		} else {
			dispatch(uiActions.closeModal());
		}
	};

	return (
		<ModalFrame testID='cancel-modal'>
			<View style={styles.box}>
				<Text style={styles.title}>{t('BUY_POPUP.UNDO_POPUP.TITLE')}</Text>
				<Text style={styles.text}>
					{t('BUY_POPUP.UNDO_POPUP.DETAILS.0')} <Text style={styles.bold}>{t('BUY_POPUP.UNDO_POPUP.DETAILS.1')}</Text>{' '}
					{t('BUY_POPUP.UNDO_POPUP.DETAILS.2')}
				</Text>
			</View>
			<ButtonRow>
				<Button mode='contained' onPress={no} style={styles.flex} testID='cancel-no-button'>
					{t('NO')}
				</Button>
				<Button mode='outlined' onPress={() => void yes()} disabled={busy} style={styles.flex} testID='cancel-yes-button'>
					{t('YES')}
				</Button>
			</ButtonRow>
		</ModalFrame>
	);
}

export function IssueModal({
	orderId,
	isPaid,
	deliveryIssue,
	warehouseIssue,
}: {
	orderId: string;
	isPaid: boolean;
	deliveryIssue: boolean;
	warehouseIssue: boolean;
}) {
	const { t } = useTranslation();
	const { routers } = useServices();
	const store = useAppStore();
	const dispatch = useAppDispatch();

	const ok = async () => {
		try {
			await closeIssue({ routers, store }, orderId, isPaid);
		} catch (error) {
			console.warn('Could not cancel the order', error);
		}
		navigateRoot('Products');
		dispatch(uiActions.closeModal());
	};

	return (
		<ModalFrame testID='issue-modal'>
			<IssueTexts deliveryIssue={deliveryIssue} warehouseIssue={warehouseIssue} />
			<Button mode='contained' onPress={() => void ok()} testID='issue-ok-button'>
				{t('OK')}
			</Button>
		</ModalFrame>
	);
}

export function CallModal() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	return (
		<ModalFrame testID='call-modal'>
			<View style={styles.box}>
				<Text style={styles.title}>{t('SIDE_MENU.GROUPS.INFO.CALL.WE_APPOLOGISE')}</Text>
				<Text style={styles.text}>{t('SIDE_MENU.GROUPS.INFO.CALL.CALL_UNSUCCESSFULL')}</Text>
			</View>
			<Button mode='contained' onPress={() => dispatch(uiActions.closeModal())} testID='call-ok-button'>
				{t('OK')}
			</Button>
		</ModalFrame>
	);
}

export function MapModal({ origin, destination }: { origin: Coordinates | null; destination: Coordinates | null }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	return (
		<ModalFrame testID='map-modal' onDismiss={() => dispatch(uiActions.closeModal())}>
			<Text style={styles.title}>{t('MAP')}</Text>
			<OrderMap
				points={mapPoints([
					['customer', origin],
					['store', destination],
				])}
				route
				height={320}
			/>
			<Button mode='contained' onPress={() => dispatch(uiActions.closeModal())} testID='map-close-button'>
				{t('CLOSE')}
			</Button>
		</ModalFrame>
	);
}

const styles = StyleSheet.create({
	box: { backgroundColor: colors.secondary, padding: 12, borderRadius: 4, alignItems: 'center', gap: 6 },
	title: { color: colors.light, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
	text: { color: colors.light, textAlign: 'center' },
	bold: { fontWeight: 'bold' },
	flex: { flex: 1 },
});
