import { StyleSheet, Dimensions, Platform } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const CONSTANT_SIZE = {
	FONT_SIZE_SM: 11,
	FONT_SIZE: 14,
	FONT_SIZE_MD: 17,
	FONT_SIZE_LG: 20,
	FONT_SIZE_XLG: 23,
	NO_SPACE: 0,
	SPACE_SM: 8,
	SPACE: 16,
	SPACE_MD: 24,
	SPACE_LG: 32,
	SPACE_XLG: 40,
	BOTTOM_NAVBAR_HEIGHT: 80,
	STATUS_BAR_HEIGHT: 24,
	SCREEN_HEIGHT: Dimensions.get('screen').height,
	SCREEN_WIDTH: Dimensions.get('screen').width,
	WINDOW_HEIGHT: Dimensions.get('window').height,
	WINDOW_WIDTH: Dimensions.get('window').width,
	DRAWER_HEADER_HEIGHT: 56,
};

export const CONSTANT_COLOR = {
	primary: '#2A2C39',
	primaryLight: '#444654',
	primaryHightLight: '#676977',
	light: '#f4f5f8',
	dark: '#222428',
	secondary: '#bd4742',
	secondaryLight: '#d36b67',
	secondaryHighLight: '#f27f7b',
	gray: '#8f96a7',
	grayLight: '#b3bbce',
	grayHighLight: '#dce3f4',

	facebook: '#3B5998',
	google: '#DD4B39',
	tertiary: '#7044ff',
	success: '#10dc60',
	danger: '#f04141',
	warning: '#ffce00',
	white: '#FFF',
	input: '#edeef2',
};

export const GLOBAL_STYLE = StyleSheet.create({
	FF_NunitoExtraLight: {
		fontFamily: 'Nunito-ExtraLight',
	},
	FF_NunitoLight: {
		fontFamily: 'Nunito-Light',
	},
	FF_Nunito: {
		fontFamily: 'Nunito-Regular',
	},
	FF_NunitoSemiBold: {
		fontFamily: 'Nunito-SemiBold',
	},
	FF_NunitoBold: {
		fontFamily: 'Nunito-Bold',
	},
	FF_NunitoBlack: {
		fontFamily: 'Nunito-Black',
	},
	FF_Lobster: {
		fontFamily: 'Lobster-Regular',
	},
	screen: {
		flex: 1,
		backgroundColor: CONSTANT_COLOR.primary,
	},
	screenStatic: {
		height: CONSTANT_SIZE.SCREEN_HEIGHT,
		backgroundColor: CONSTANT_COLOR.primary,
	},
	screenStaticNav: {
		flex: 1,
		marginBottom: CONSTANT_SIZE.BOTTOM_NAVBAR_HEIGHT,
		backgroundColor: CONSTANT_COLOR.primary,
	},
	bgPrimary: {
		backgroundColor: CONSTANT_COLOR.primary,
	},
	bgPrimaryLight: {
		backgroundColor: CONSTANT_COLOR.primaryLight,
	},
	bgSecondary: {
		backgroundColor: CONSTANT_COLOR.secondary,
	},
	bgSecondaryLight: {
		backgroundColor: CONSTANT_COLOR.secondaryLight,
	},
	bgLight: {
		backgroundColor: CONSTANT_COLOR.light,
	},
	bgDanger: {
		backgroundColor: CONSTANT_COLOR.danger,
	},
	bgSuccess: {
		backgroundColor: CONSTANT_COLOR.success,
	},
	bgTransparent: {
		backgroundColor: 'transparent',
	},
	txtPrimary: {
		color: CONSTANT_COLOR.primary,
	},
	txtPrimaryLight: {
		color: CONSTANT_COLOR.primaryLight,
	},
	txtSecondary: {
		color: CONSTANT_COLOR.secondary,
	},
	txtSecondaryLight: {
		color: CONSTANT_COLOR.secondaryLight,
	},
	txtSuccess: {
		color: CONSTANT_COLOR.success,
	},
	txtDanger: {
		color: CONSTANT_COLOR.danger,
	},
	txtCenter: {
		textAlign: 'center',
	},
	txtUpper: {
		textTransform: 'uppercase',
	},
	txtLower: {
		textTransform: 'lowercase',
	},
	txtCapitalize: {
		textTransform: 'capitalize',
	},
	fontBold: {
		fontWeight: 'bold',
	},
	fontItalic: {
		fontStyle: 'italic',
	},
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		marginHorizontal: 20,
		paddingHorizontal: 10,
	},
	content: {},
	dNone: {
		display: 'none',
	},
	section: {
		backgroundColor: CONSTANT_COLOR.light,
		padding: 10,
		marginBottom: 10,
	},
	titleSection: {
		color: CONSTANT_COLOR.secondary,
		marginBottom: 10,
		textTransform: 'uppercase',
		fontWeight: 'bold',
	},
	w100: {
		width: '100%',
	},
	w75: {
		width: '75%',
	},
	w50: {
		width: '50%',
	},
	w25: {
		width: '25%',
	},
	h100: {
		height: '100%',
	},
	h75: {
		height: '75%',
	},
	h50: {
		height: '50%',
	},
	h25: {
		height: '25%',
	},
	m0: {
		margin: 0,
	},
	m1: {
		margin: 5,
	},
	m2: {
		margin: 10,
	},
	m3: {
		margin: 15,
	},
	m4: {
		margin: 20,
	},
	m5: {
		margin: 25,
	},
	mt0: {
		marginTop: 0,
	},
	mt1: {
		marginTop: 5,
	},
	mt2: {
		marginTop: 10,
	},
	mt3: {
		marginTop: 15,
	},
	mt4: {
		marginTop: 20,
	},
	mt5: {
		marginTop: 25,
	},
	mb0: {
		marginBottom: 0,
	},
	mb1: {
		marginBottom: 5,
	},
	mb2: {
		marginBottom: 10,
	},
	mb3: {
		marginBottom: 15,
	},
	mb4: {
		marginBottom: 20,
	},
	mb5: {
		marginBottom: 25,
	},
	ml0: {
		marginLeft: 0,
	},
	ml1: {
		marginLeft: 5,
	},
	ml2: {
		marginLeft: 10,
	},
	ml3: {
		marginLeft: 15,
	},
	ml4: {
		marginLeft: 20,
	},
	ml5: {
		marginLeft: 25,
	},
	mr0: {
		marginRight: 0,
	},
	mr1: {
		marginRight: 5,
	},
	mr2: {
		marginRight: 10,
	},
	mr3: {
		marginRight: 15,
	},
	mr4: {
		marginRight: 20,
	},
	mr5: {
		marginRight: 25,
	},
	my0: {
		marginVertical: 0,
	},
	my1: {
		marginVertical: 5,
	},
	my2: {
		marginVertical: 10,
	},
	my3: {
		marginVertical: 15,
	},
	my4: {
		marginVertical: 20,
	},
	my5: {
		marginVertical: 25,
	},
	mx0: {
		marginHorizontal: 0,
	},
	mx1: {
		marginHorizontal: 5,
	},
	mx2: {
		marginHorizontal: 10,
	},
	mx3: {
		marginHorizontal: 15,
	},
	mx4: {
		marginHorizontal: 20,
	},
	mx5: {
		marginHorizontal: 25,
	},
	p0: {
		padding: 0,
	},
	p1: {
		padding: 5,
	},
	p2: {
		padding: 10,
	},
	p3: {
		padding: 15,
	},
	p4: {
		padding: 20,
	},
	p5: {
		padding: 25,
	},
	pt0: {
		paddingTop: 0,
	},
	pt1: {
		paddingTop: 5,
	},
	pt2: {
		paddingTop: 10,
	},
	pt3: {
		paddingTop: 15,
	},
	pt4: {
		paddingTop: 20,
	},
	pt5: {
		paddingTop: 25,
	},
	pb0: {
		paddingBottom: 0,
	},
	pb1: {
		paddingBottom: 5,
	},
	pb2: {
		paddingBottom: 10,
	},
	pb3: {
		paddingBottom: 15,
	},
	pb4: {
		paddingBottom: 20,
	},
	pb5: {
		paddingBottom: 25,
	},
	pl0: {
		paddingLeft: 0,
	},
	pl1: {
		paddingLeft: 5,
	},
	pl2: {
		paddingLeft: 10,
	},
	pl3: {
		paddingLeft: 15,
	},
	pl4: {
		paddingLeft: 20,
	},
	pl5: {
		paddingLeft: 25,
	},
	pr0: {
		paddingRight: 0,
	},
	pr1: {
		paddingRight: 5,
	},
	pr2: {
		paddingRight: 10,
	},
	pr3: {
		paddingRight: 15,
	},
	pr4: {
		paddingRight: 20,
	},
	pr5: {
		paddingRight: 25,
	},
	py0: {
		paddingVertical: 0,
	},
	py1: {
		paddingVertical: 5,
	},
	py2: {
		paddingVertical: 10,
	},
	py3: {
		paddingVertical: 15,
	},
	py4: {
		paddingVertical: 20,
	},
	py5: {
		paddingVertical: 25,
	},
	px0: {
		paddingHorizontal: 0,
	},
	px1: {
		paddingHorizontal: 5,
	},
	px2: {
		paddingHorizontal: 10,
	},
	px3: {
		paddingHorizontal: 15,
	},
	px4: {
		paddingHorizontal: 20,
	},
	px5: {
		paddingHorizontal: 25,
	},
	imgCover: {
		height: undefined,
		width: undefined,
		resizeMode: 'cover',
		flex: 1,
	},
	noShadow: {
		shadowColor: 'transparent',
		shadowOffset: { width: 0, height: 0 },
		shadowRadius: 0,
		shadowOpacity: 0,
		elevation: 0,
	},
	shadowSm: {
		shadowColor: CONSTANT_COLOR.dark,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 5,
		shadowOpacity: 0.2,
		elevation: 2,
	},
	shadow: {
		shadowColor: CONSTANT_COLOR.dark,
		shadowOffset: { width: 1, height: 1.5 },
		shadowRadius: 5,
		shadowOpacity: 0.5,
		elevation: 5,
	},
	shadowLg: {
		shadowColor: isIOS ? '#000' : CONSTANT_COLOR.dark,
		shadowOffset: {
			width: isIOS ? 0 : 2,
			height: 2,
		},
		shadowOpacity: isIOS ? 0.25 : 0.7,
		shadowRadius: isIOS ? 3.84 : 5,

		elevation: 8.5,
	},
	rounded0: {
		borderRadius: 0,
	},
	roundedSm: {
		borderRadius: 5,
	},
	rounded: {
		borderRadius: 10,
	},
	roundedMd: {
		borderRadius: 20,
	},
	roundedLg: {
		borderRadius: 30,
	},
	noBorder: {
		borderColor: 'transparent',
		borderWidth: 0,
	},
	borderSm: {
		borderColor: CONSTANT_COLOR.gray,
		borderWidth: 0.5,
	},
	border: {
		borderColor: CONSTANT_COLOR.gray,
		borderWidth: 1,
	},
	borderMd: {
		borderColor: CONSTANT_COLOR.gray,
		borderWidth: 2,
	},
	borderLg: {
		borderColor: CONSTANT_COLOR.gray,
		borderWidth: 4,
	},
	separator: {
		borderTopColor: CONSTANT_COLOR.gray,
		borderTopWidth: 1,
		marginVertical: 10,
		padding: 0,
	},
	overlay: {
		position: 'absolute',
		flex: 1,
		height: '100%',
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.3)',
	},
	positionAbsolute: {
		position: 'absolute',
	},
	positionRelative: {
		position: 'relative',
	},
	positionReset: {
		position: undefined,
	},
	t0: {
		top: 0,
	},
	b0: {
		bottom: 0,
	},
	l0: {
		left: 0,
	},
	r0: {
		right: 0,
	},
	card: {
		position: 'relative',
		padding: 15,
		borderRadius: 10,
		backgroundColor: 'white',
	},
	cardBtnClose: {
		position: 'absolute',
		right: 10,
	},
	tabsContainer: {
		backgroundColor: CONSTANT_COLOR.light,
		flexDirection: 'row',
		alignItems: 'stretch',
	},
	tab: {
		paddingVertical: 12,
		borderBottomWidth: 3,
		borderBottomColor: CONSTANT_COLOR.light,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	activeTab: {
		borderBottomColor: CONSTANT_COLOR.primary,
	},
	tabName: {
		color: CONSTANT_COLOR.primary,
		fontWeight: 'bold',
	},
	tabIcon: {
		marginRight: 4,
	},
	selectContainer: {
		borderBottomColor: CONSTANT_COLOR.primary,
		borderBottomWidth: 1,
		width: 130,
		height: 35,
		paddingHorizontal: 0,
		alignItems: 'center',
	},
	selectItem: {
		width: '100%',
		height: '100%',
		color: CONSTANT_COLOR.gray,
		fontSize: 15,
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginHorizontal: 30,
		marginVertical: 10,
	},
	stat: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	statAmount: {
		color: CONSTANT_COLOR.gray,
		fontSize: 18,
		fontWeight: 'bold',
	},
	statTitle: {
		color: CONSTANT_COLOR.gray,
		fontSize: 12,
		fontWeight: '500',
		textTransform: 'capitalize',
		marginTop: 4,
	},
	form: {
		marginBottom: 32,
	},
	field: {
		marginBottom: 20,
	},
	inputTitle: {
		color: CONSTANT_COLOR.gray,
		fontSize: 10,
		textTransform: 'uppercase',
		marginBottom: 0,
	},
	inputGroup: {
		flexDirection: 'row',
		alignItems: 'stretch',
	},
	appendTag: {},
	input: {
		height: 40,
		borderBottomWidth: 1,
		borderBottomColor: CONSTANT_COLOR.primary,
		color: CONSTANT_COLOR.gray,
		fontSize: 15,
		paddingHorizontal: 10,
	},
	th: {
		height: 40,
		backgroundColor: CONSTANT_COLOR.light,
	},
	column: {
		flexDirection: 'column',
	},
	row: {
		flexDirection: 'row',
	},
	alignBaseline: { alignItems: 'baseline' },
	alignCenter: { alignItems: 'center' },
	alignEnd: { alignItems: 'flex-end' },
	alignStart: { alignItems: 'flex-start' },
	alignStretch: { alignItems: 'stretch' },
	justifyCenter: { justifyContent: 'center' },
	justifyEnd: { justifyContent: 'flex-end' },
	justifyStart: { justifyContent: 'flex-start' },
	justifyAround: { justifyContent: 'space-around' },
	justifyBetween: { justifyContent: 'space-between' },
	justifyEvenly: { justifyContent: 'space-evenly' },
	inlineItems: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	justifyContentBetween: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	flex1: {
		flex: 1,
	},
	flexWrap: {
		flexWrap: 'wrap',
	},
	tableBtn: {
		padding: 5,
		flexDirection: 'row',
		justifyContent: 'center',
		marginHorizontal: 5,
		paddingHorizontal: 10,
		borderRadius: 5,
	},
	errorContainer: {
		paddingVertical: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	errorMessage: {
		color: CONSTANT_COLOR.primary,
		fontSize: 13,
		fontWeight: '400',
		textAlign: 'center',
	},
	btn: {
		height: 45,
		borderRadius: 5,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(0,0,0,0)',
		marginVertical: 5,
		paddingHorizontal: 20,
	},
	btnPrimary: {
		backgroundColor: CONSTANT_COLOR.primary,
		borderColor: CONSTANT_COLOR.primary,
	},
	btnPrimaryLight: {
		backgroundColor: CONSTANT_COLOR.primaryLight,
		borderColor: CONSTANT_COLOR.primaryLight,
	},
	btnSecondary: {
		backgroundColor: CONSTANT_COLOR.secondary,
		borderColor: CONSTANT_COLOR.secondary,
	},
	btnTopLeft: {
		position: 'absolute',
		top: 30,
		left: 20,
		width: 40,
		height: 40,
		borderRadius: 40 / 2,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(22, 22, 43, 0.2)',
	},
	btnBottomRight: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 40 / 2,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(22, 22, 43, 0.2)',
	},
	accordionTitle: {
		color: CONSTANT_COLOR.secondary,
	},
	image: {
		flex: 1,
		height: undefined,
		width: undefined,
		resizeMode: 'cover',
	},
	inputPicker: {
		borderColor: CONSTANT_COLOR.input,
		borderWidth: 1,
		height: 30,
		width: '100%',
		color: CONSTANT_COLOR.gray,
		borderRadius: 7,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 5,
	},
	inputPickerLabel: {
		fontSize: 12,
		color: CONSTANT_COLOR.gray,
		paddingRight: 0,
		width: '85%',
	},
	inputPickerIcon: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-end',
		width: '15%',
	},
	textarea: {
		borderColor: CONSTANT_COLOR.grayLight,
		borderWidth: 1,
		borderRadius: 5,
		overflow: 'hidden',
		height: 100,
	},
});
