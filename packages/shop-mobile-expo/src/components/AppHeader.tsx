import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';

export interface AppHeaderProps {
	title?: string;
	/** Back button ("BACK") on the end side; omitted when null. */
	onBack?: (() => void) | null;
	backLabel?: string;
	/** Extra content between the title and the back button (feed toggles, signs). */
	children?: React.ReactNode;
	showMenu?: boolean;
}

/** The Ionic toolbar: menu button, title, optional actions and a Back button. */
export function AppHeader({ title, onBack, backLabel, children, showMenu = true }: AppHeaderProps) {
	const navigation = useNavigation();
	const { t } = useTranslation();

	return (
		<Appbar.Header style={styles.header} statusBarHeight={0} testID='app-header'>
			{showMenu && (
				<Appbar.Action
					icon='menu'
					color={colors.light}
					accessibilityLabel='Menu'
					testID='menu-button'
					onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
				/>
			)}
			{title ? (
				<Appbar.Content title={title} titleStyle={styles.title} testID='app-header-title' />
			) : (
				<View style={styles.spacer} />
			)}
			{children}
			{onBack && (
				<Appbar.Action
					icon='chevron-left'
					color={colors.light}
					accessibilityLabel={backLabel ?? t('BACK')}
					testID='back-button'
					onPress={onBack}
				/>
			)}
		</Appbar.Header>
	);
}

const styles = StyleSheet.create({
	header: { backgroundColor: colors.primary, elevation: 0 },
	title: { color: colors.light, fontSize: 18 },
	spacer: { flex: 1 },
});
