import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { colors } from '../theme';

/** The Ionic `order-info-modal` look: a dark box over the blurred page, optional × in the corner. */
export function ModalFrame({
	children,
	onDismiss,
	onClose,
	testID,
}: {
	children: React.ReactNode;
	/** Backdrop tap / Android back. */
	onDismiss?: () => void;
	/** Shows the × button. */
	onClose?: () => void;
	testID: string;
}) {
	return (
		<Portal>
			<Modal
				visible
				onDismiss={onDismiss}
				dismissable={!!onDismiss}
				contentContainerStyle={styles.container}
				testID={testID}>
				{onClose && (
					<Pressable onPress={onClose} style={styles.close} testID='modal-close' accessibilityLabel='Close'>
						<MaterialCommunityIcons name='close' size={22} color={colors.light} />
					</Pressable>
				)}
				<ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
			</Modal>
		</Portal>
	);
}

export function ButtonRow({ children }: { children: React.ReactNode }) {
	return <View style={styles.buttons}>{children}</View>;
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.primary,
		marginHorizontal: 16,
		borderRadius: 6,
		maxHeight: '90%',
		overflow: 'hidden',
	},
	content: { padding: 12, gap: 8 },
	close: { position: 'absolute', top: 6, right: 6, zIndex: 3, padding: 4 },
	buttons: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
});
