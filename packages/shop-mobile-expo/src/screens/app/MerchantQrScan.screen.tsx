import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import React, { useState } from 'react';
import {
	Text,
	View,
	StyleSheet,
	TouchableOpacity,
	Image,
	Dimensions,
} from 'react-native';
import {
	FocusAwareStatusBar,
	CustomScreenHeader,
} from '../../components/Common';
import { getLanguage } from '../../store/features/translation';
import { useAppSelector } from '../../store/hooks';
import MaterialIcon from '@expo/vector-icons/MaterialCommunityIcons';
import { showMessage } from 'react-native-flash-message';
import { BarCodeScanner } from 'expo-barcode-scanner';
// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';
import { isEmpty } from 'validate.js';
import { useQuery } from '@apollo/client';
import { GET_ALL_STORE_QUERY } from '../../client/merchants/queries';

type IWarehouse = {
	id: string;
};

const MerchantQrScanSearch = () => {
	const [hasPermission, setHasPermission] = useState<Boolean>();
	const [scanned, setScanned] = useState<Boolean>(false);
	const [flash, setFlash] = useState<boolean>(false);
	const [load, setLoad] = useState<Boolean>(true);

	const LANGUAGE = useAppSelector(getLanguage);
	const NAVIGATION = useNavigation();
	const isFocused = useIsFocused();

	const ALL_STORE_QUERY_RESPONSE = useQuery(GET_ALL_STORE_QUERY);

	React.useEffect(() => {
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === 'granted');
		})();
	}, [load]);

	const handleBarCodeScanned = ({ type, data }: any) => {
		if (typeof data === 'string' && type === 256) {
			if (!isEmpty(data)) {
				const ROUTE_WAREHOUSE_ID = {
					warehouseId: data,
				};

				const store = ALL_STORE_QUERY_RESPONSE?.data?.getAllStores.find(
					(t: IWarehouse) => t.id === data,
				);

				if (store !== undefined) {
					NAVIGATION.navigate(
						'DRAWER/IN_STORE' as never,
						ROUTE_WAREHOUSE_ID as never,
					);
				} else {
					showMessage({
						message: ' ' + LANGUAGE.QR_SCAN_VIEW.UNKOWN_MERCHANT,
						type: 'danger',
					});
				}
			}
		}
		setScanned(true);
	};

	if (hasPermission === null) console.log('Requesting for camera permission');
	if (hasPermission === false) console.log('No access to camera');

	const resetScan = () => {
		setScanned(false);
		setLoad(false);

		setTimeout(() => {
			setLoad(true);
		}, 100);
	};

	const dimensions = React.useRef(Dimensions.get('window'));
	const screenWidth = dimensions.current.width;
	const cameraHeight = Math.round((screenWidth * 16) / 9);

	return (
		<View style={GS.flex1}>
			<View>
				<FocusAwareStatusBar
					translucent={true}
					backgroundColor='transparent'
					barStyle='light-content'
				/>

				<CustomScreenHeader
					title={LANGUAGE.MERCHANTS_VIEW.NAME}
					showBackBtn
				/>
			</View>
			{isFocused && load ? (
				<View style={{ ...GS.screen, backgroundColor: '#222' }}>
					<Camera
						style={{
							...styles.barCodeScanner,
							height: cameraHeight,
						}}
						type={Camera.Constants.Type.back}
						ratio='16:9'
						flashMode={
							flash
								? Camera.Constants.FlashMode.torch
								: Camera.Constants.FlashMode.off
						}
						barCodeScannerSettings={{
							barCodeTypes: [
								BarCodeScanner.Constants.BarCodeType.qr,
							],
						}}
						onBarCodeScanned={
							scanned ? undefined : handleBarCodeScanned
						}
					/>

					<View style={styles.wrapper}>
						<View style={{ ...styles.unfocusedZone }} />
						<View style={{ ...GS.row }}>
							<View style={{ ...styles.unfocusedZone }} />
							<View style={{ ...GS.centered }}>
								<Image
									source={require('../../assets/img/QR.png')}
									style={styles.scanner}
									resizeMode='contain'
								/>
							</View>
							<View style={{ ...styles.unfocusedZone }} />
						</View>
						<View style={{ ...styles.unfocusedZone }} />
					</View>

					<View style={{ ...styles.content }}>
						<Text style={styles.txt}>
							{LANGUAGE.QR_SCAN_VIEW.SCAN_EVER_ONLY}
						</Text>
						{scanned && (
							<Text
								style={{
									...styles.txt,
									...GS.txtPrimaryLight,
								}}>
								{LANGUAGE.QR_SCAN_VIEW.SCAN_AGAIN}
							</Text>
						)}
						<View style={styles.actionButtons}>
							<TouchableOpacity
								style={[
									styles.iconWrapper,
									{
										backgroundColor: flash
											? 'rgba(255,255,255,0.2)'
											: 'rgba(255,255,255,0.1)',
									},
								]}
								onPress={() => {
									setFlash(!flash);
								}}>
								<MaterialIcon
									name='flashlight'
									size={30}
									color='#fff'
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.iconWrapper}
								onPress={() => {
									resetScan();
								}}>
								<MaterialIcon
									name={
										scanned === true
											? 'reload-alert'
											: 'reload'
									}
									size={30}
									color='#fff'
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.iconWrapper}
								onPress={() => {
									NAVIGATION.goBack();
								}}>
								<MaterialIcon
									name='close'
									size={30}
									color='red'
								/>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
	},
	scanner: {
		width: (Dimensions.get('screen').width / 100) * 70,
		height: (Dimensions.get('screen').width / 100) * 70,
		transform: [{ scale: 1.05 }],
		zIndex: 10,
	},
	barCodeScanner: {
		...StyleSheet.absoluteFillObject,
		...GS.w100,
		position: 'absolute',
		transform: [{ translateY: 50 }],
	},
	wrapper: {
		...StyleSheet.absoluteFillObject,
		...GS.w100,
		position: 'absolute',
	},
	unfocusedZone: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.7)',
	},
	txt: {
		...GS.txtCenter,
		...GS.mb2,
		color: CC.light,
		fontSize: 18,
	},
	content: {
		...GS.py4,
		...GS.px5,
		position: 'absolute',
		bottom: 0,
		width: '100%',
		backgroundColor: 'rgba(0,0,0,0.5)',
		alignItems: 'center',
	},
	actionButtons: {
		...GS.row,
		...GS.centered,
		...GS.py1,
	},
	iconWrapper: {
		...GS.mr2,
		borderRadius: 20,
		padding: 5,
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
});
export default MerchantQrScanSearch;
