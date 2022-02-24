//
import LoadingScreen from './Loading.screen';
import Blank_Screen from './Blank_.screen';

// REGISTRATION
import SignUpScreen from './registration/SignUp.screen';
import SignUpByAddressScreen from './registration/SignUpByAddress.screen';

// APP
import HomeScreen from './app/Home.screen';
import OrderHistoryScreen from './app/OrderHistory.screen';
import AccountScreen from './app/Account.screen';
import TranslationScreen from './app/Translation.screen';
import MerchantsSearchScreen from './app/MerchantsSearch.screen';

// TODO: create a type for screens object

const SCREENS = {
	// SCREENS
	Loading: LoadingScreen,
	Blank_: Blank_Screen,
	APP: {
		Home: HomeScreen,
		OrderHistory: OrderHistoryScreen,
		Account: AccountScreen,
		Translation: TranslationScreen,
		MerchantsSearch: MerchantsSearchScreen,
	},
	REGISTRATION: {
		SIGN_UP: SignUpScreen,
		SIGN_UP_BY_ADDRESS: SignUpByAddressScreen,
	},
};

export default SCREENS;
