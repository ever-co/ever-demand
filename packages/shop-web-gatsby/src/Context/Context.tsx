import React, {
	createContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react';
import { navigate } from 'gatsby';
import { ThemeProvider } from '@mui/material/styles';
import auth from '../auth/auth';
import { config } from '../config';
import theme from '../theme';

/** [latitude, longitude] of the visitor. */
export type Coordinates = [number, number];

export interface AppContextValue {
	coordinates: Coordinates | null;
	setCoordinates: (coordinates: Coordinates | null) => void;
	deliveryOnly: boolean;
	setDeliveryOnly: (deliveryOnly: boolean) => void;
	orders: any[];
	setOrders: (orders: any[]) => void;
	getUser: typeof auth.getUser;
	setUser: typeof auth.setUser;
	getlocale: typeof auth.getlocale;
	setlocale: typeof auth.setlocale;
	isLoggedIn: typeof auth.isLoggedIn;
	logout: typeof auth.logout;
}

const AppContext = createContext<AppContextValue | null>(null);

/**
 * The visitor's location: GATSBY_DEFAULT_LATITUDE/LONGITUDE when set, else the browser
 * location, else the fallback of src/config.ts.
 */
export function locate(
	onLocation: (coordinates: Coordinates) => void,
	settings = config,
	geolocation: Geolocation | undefined = typeof navigator !== 'undefined'
		? navigator.geolocation
		: undefined,
) {
	if (settings.defaultLatitude != null && settings.defaultLongitude != null) {
		onLocation([settings.defaultLatitude, settings.defaultLongitude]);
		return;
	}

	const fallback = () =>
		onLocation([settings.fallbackLatitude, settings.fallbackLongitude]);

	if (!geolocation) {
		fallback();
		return;
	}

	geolocation.getCurrentPosition(
		(position) =>
			onLocation([position.coords.latitude, position.coords.longitude]),
		(positionError) => {
			console.log(positionError);
			fallback();
		},
	);
}

const Provider = ({ children }: { children?: ReactNode }) => {
	const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
	const [deliveryOnly, setDeliveryOnly] = useState(false);
	const [orders, setOrders] = useState<any[]>([]);

	useEffect(() => {
		if (!coordinates) {
			locate(setCoordinates);
		}
	}, [coordinates]);

	const userId = auth.getUser().id;

	useEffect(() => {
		// The shop is for signed-up customers: the sign-up asks for the address first
		if (!userId && !window.location.pathname.startsWith('/login')) {
			navigate('/login');
		}
	});

	return (
		<AppContext.Provider
			value={{
				...auth,
				coordinates,
				setCoordinates,
				deliveryOnly,
				setDeliveryOnly,
				orders,
				setOrders,
			}}
		>
			<ThemeProvider theme={theme}>{children}</ThemeProvider>
		</AppContext.Provider>
	);
};

export { AppContext, Provider };

export default Provider;
