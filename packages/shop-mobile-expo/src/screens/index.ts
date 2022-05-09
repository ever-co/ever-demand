//
import LoadingScreen from './Loading.screen';
import Blank_Screen from './Blank_.screen';

// REGISTRATION
import HomeAuthScreen from './authentication/Home.screen';
import SignUpScreen from './authentication/SignUp.screen';
import SignInScreen from './authentication/SignIn.screen';
import SignUpByAddressScreen from './authentication/SignUpByAddress.screen';

// APP
import HomeScreen from './app/Home.screen';
import OrderHistoryScreen from './app/OrderHistory.screen';
import AccountScreen from './app/Account.screen';
import TranslationScreen from './app/Translation.screen';
import SearchScreen from './app/Search.screen';
import MerchantsSearchScreen from './app/MerchantsSearch.screen';
import InStoreScreen from './app/InStore.screen';
import ProductDetailsScreen from './app/ProductDetails';
import OrderScreen from './app/Order.screen';

// TODO: create a type for screens object

const SCREENS = {
	// SCREENS
	LOADING: LoadingScreen,
	BLANK_: Blank_Screen,
	APP: {
		HOME: HomeScreen,
		ORDER_HISTORY: OrderHistoryScreen,
		ACCOUNT: AccountScreen,
		TRANSLATION: TranslationScreen,
		SEARCH: SearchScreen,
		MERCHANTS_SEARCH: MerchantsSearchScreen,
		IN_STORE: InStoreScreen,
		PRODUCT_DETAILS: ProductDetailsScreen,
		ORDER: OrderScreen,
	},
	REGISTRATION: {
		HOME: HomeAuthScreen,
		SIGN_IN: SignInScreen,
		SIGN_UP: SignUpScreen,
		SIGN_UP_BY_ADDRESS: SignUpByAddressScreen,
	},
};

export default SCREENS;
