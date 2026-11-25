/** Merchants list (`/merchants`, feature inventory §4.14). */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, List, Searchbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { firstValueFrom } from 'rxjs';
import { AppHeader } from '../components/AppHeader';
import { WarehouseLogo } from '../components/ProductBits';
import { QrScanner } from '../components/QrScanner';
import type { Location, Merchant } from '../domain/types';
import { useGuard } from '../hooks/useGuard';
import { navigateRoot } from '../navigation/actions';
import { useServices } from '../services/container';
import { toLocation } from '../services/location';
import { useAppDispatch, useAppStore } from '../store';
import { sessionActions } from '../store/session';
import { colors } from '../theme';

export function MerchantsScreen() {
	const allowed = useGuard('Merchants');
	const { t } = useTranslation();
	const services = useServices();
	const { routers, graphql, env } = services;
	const store = useAppStore();
	const dispatch = useAppDispatch();
	const [searchName, setSearchName] = useState('');
	const [merchants, setMerchants] = useState<Merchant[] | null>(null);
	const [scanning, setScanning] = useState(false);
	const location = useRef<Location | null>(null);

	/** The user's address in production, else the current location. */
	const getLocation = useCallback(async (): Promise<Location> => {
		if (location.current) {
			return location.current;
		}
		const { userId } = store.getState().session;
		if (userId && env.PRODUCTION) {
			const user = await firstValueFrom(routers.user.get(userId));
			if (user?.geoLocation?.loc) {
				location.current = { type: 'Point', coordinates: user.geoLocation.loc.coordinates };
				return location.current;
			}
		}
		location.current = toLocation(await services.location.getCurrentCoords());
		return location.current;
	}, [env.PRODUCTION, routers, services.location, store]);

	// Close merchants when the search is empty, else by name (debounced like the Ionic 1 s).
	useEffect(() => {
		let active = true;
		const timer = setTimeout(
			async () => {
				try {
					const loc = await getLocation();
					const found = searchName
						? await graphql.getMerchantsByName(searchName, { loc })
						: await graphql.getCloseMerchants({ loc });
					active && setMerchants(found);
				} catch (error) {
					console.warn('Could not load the merchants', error);
					active && setMerchants([]);
				}
			},
			searchName ? 1000 : 0,
		);
		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, [getLocation, graphql, searchName]);

	const selectMerchant = (merchant: Merchant) => {
		dispatch(sessionActions.setInStore(merchant.id));
		navigateRoot('Products');
	};

	const onScanned = async (id: string) => {
		setScanning(false);
		try {
			const merchant = await firstValueFrom(routers.warehouse.get(id));
			if (merchant?.name) {
				setSearchName(merchant.name);
			}
		} catch (error) {
			console.warn('Unknown store code', error);
		}
	};

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	return (
		<View style={styles.screen} testID='merchants-screen'>
			<AppHeader title={t('MERCHANTS')} onBack={() => navigateRoot('Products')} />
			<View style={styles.searchRow}>
				<Searchbar
					value={searchName}
					onChangeText={setSearchName}
					placeholder={t('MERCHANTS_VIEW.NAME')}
					style={styles.search}
					testID='merchants-search'
				/>
				<Button
					mode='contained'
					onPress={() => setScanning(true)}
					icon={() => <MaterialCommunityIcons name='qrcode' size={16} color={colors.white} />}
					testID='merchants-scan'>
					{t('SCAN')}
				</Button>
			</View>
			<Text style={styles.header} testID='merchants-header'>
				{searchName ? `${t('MERCHANTS_VIEW.WITH_NAME')} '${searchName}'` : t('MERCHANTS_VIEW.CLOSE_TO_YOU')}
			</Text>
			{merchants && merchants.length === 0 && (
				<Text style={styles.notFound} testID='merchants-not-found'>
					{t('NOT_FOUND')}
				</Text>
			)}
			<FlatList
				data={merchants ?? []}
				keyExtractor={(merchant) => merchant.id}
				renderItem={({ item }) => (
					<List.Item
						title={item.name}
						titleStyle={styles.name}
						onPress={() => selectMerchant(item)}
						left={() => <WarehouseLogo logo={item.logo} size={40} />}
						style={styles.item}
						testID={`merchant-${item.id}`}
					/>
				)}
				testID='merchants-list'
			/>
			{scanning && <QrScanner onScanned={(text) => void onScanned(text)} onClose={() => setScanning(false)} />}
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.black },
	searchRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
	search: { flex: 1 },
	header: { color: colors.light, paddingHorizontal: 12, paddingVertical: 6 },
	notFound: { color: colors.light, textAlign: 'center', padding: 16 },
	item: { backgroundColor: colors.primary, marginHorizontal: 8, marginVertical: 4, borderRadius: 6 },
	name: { color: colors.light },
});
