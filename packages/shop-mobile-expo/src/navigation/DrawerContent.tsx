/** Side menu (Ionic `e-cu-menu` / `e-cu-submenu`, feature inventory §3.3). */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { CommonActions } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { Divider, List } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useServices } from '../services/container';
import { useAppDispatch } from '../store';
import { uiActions } from '../store/ui';
import { colors } from '../theme';
import type { RouteName } from './types';

type Icon = keyof typeof MaterialCommunityIcons.glyphMap;

export function DrawerContent(props: DrawerContentComponentProps) {
	const { t } = useTranslation();
	const { env, call } = useServices();
	const dispatch = useAppDispatch();
	const current = props.state.routes[props.state.index]?.name;

	const go = (name: RouteName) => {
		props.navigation.closeDrawer();
		// `routerDirection="root"`: the menu replaces the history.
		props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name }] }));
	};

	const item = (route: RouteName, label: string, icon: Icon) => (
		<List.Item
			key={route}
			title={label}
			titleStyle={[styles.label, current === route && styles.active]}
			left={() => <MaterialCommunityIcons name={icon} size={22} color={colors.light} style={styles.icon} />}
			onPress={() => go(route)}
			testID={`menu-${route}`}
		/>
	);

	const callUs = async () => {
		props.navigation.closeDrawer();
		if (!(await call(env.SUPPORT_NUMBER))) {
			dispatch(uiActions.openModal({ type: 'call' }));
		}
	};

	const section = (title: string) => (
		<>
			<Divider style={styles.divider} />
			<Text style={styles.section}>{title}</Text>
		</>
	);

	return (
		<DrawerContentScrollView {...props} style={styles.drawer} testID='side-menu'>
			<View style={styles.header}>
				<Text style={styles.title}>{t('SIDE_MENU.TITLE')}</Text>
			</View>
			{item('Products', t('SIDE_MENU.GROUPS.NO_TITLE.ITEMS.PRODUCTS'), 'basket')}
			{item('OrdersHistory', t('SIDE_MENU.GROUPS.NO_TITLE.ITEMS.ORDER_HISTORY'), 'cart')}
			{section(t('SIDE_MENU.GROUPS.SETTINGS.DIVER_TITLE'))}
			{item('Language', t('SIDE_MENU.GROUPS.SETTINGS.ITEMS.LANGUAGE'), 'earth')}
			{section(t('SIDE_MENU.GROUPS.INFO.DIVER_TITLE'))}
			{item('Help', t('SIDE_MENU.GROUPS.INFO.ITEMS.FAQ'), 'help-circle')}
			{env.SUPPORT_NUMBER !== '' && (
				<List.Item
					title={t('SIDE_MENU.GROUPS.NO_TITLE.ITEMS.CALL_US')}
					titleStyle={styles.label}
					left={() => <MaterialCommunityIcons name='phone' size={22} color={colors.light} style={styles.icon} />}
					onPress={() => void callUs()}
					testID='menu-CallUs'
				/>
			)}
			{item('About', t('SIDE_MENU.GROUPS.INFO.ITEMS.ABOUT_US'), 'information')}
			{section(t('SIDE_MENU.GROUPS.LEGALS.DIVER_TITLE'))}
			{item('Privacy', t('SIDE_MENU.GROUPS.LEGALS.ITEMS.PRIVACY'), 'lock')}
			{item('TermsOfUse', t('SIDE_MENU.GROUPS.LEGALS.ITEMS.TERMS_OF_USE'), 'format-list-bulleted')}
		</DrawerContentScrollView>
	);
}

const styles = StyleSheet.create({
	drawer: { backgroundColor: colors.primary },
	header: { backgroundColor: colors.secondary, padding: 16, marginBottom: 4 },
	title: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
	label: { color: colors.light },
	active: { color: colors.secondary, fontWeight: 'bold' },
	icon: { marginLeft: 12, alignSelf: 'center' },
	divider: { backgroundColor: colors.medium, marginTop: 8 },
	section: { color: colors.medium, paddingHorizontal: 16, paddingVertical: 6, fontSize: 12 },
});
