import React, { createContext, useEffect, useState } from 'react';
import auth from '../auth';
import { navigate } from 'gatsby';
import { ThemeProvider } from '@material-ui/styles';
import theme from '../theme';

const AppContext = createContext(null);

const Provider = ({ children, ...props }) => {
	const [coordinates, setCoordinates] = useState(null);

	const [deliveryOnly, setDeliveryOnly] = useState(false);
	const [orders, setOrders] = useState([]);

	const user = auth.getUser();

	const getLocation = () => {
		if (
			typeof window !== 'undefined' &&
			typeof navigator !== 'undefined' &&
			coordinates === null
		) {
			if (process.env.DEFAULT_LATITUDE && process.env.DEFAULT_LONGITUDE) {
				setCoordinates([
					parseFloat(process.env.DEFAULT_LATITUDE),
					parseFloat(process.env.DEFAULT_LONGITUDE),
				]);
			} else {
				navigator.geolocation.getCurrentPosition(
					(pos) => {
						setCoordinates([pos.coords.latitude, pos.coords.longitude]);
					},
					(positionError) => console.log(positionError),
				);
			}
		}
	};
	useEffect(() => {
		if (typeof window !== 'undefined' && !coordinates) {
			getLocation();
		}
		if (!user.id) {
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

Provider.propTypes = {
	// bla: PropTypes.string,
};

Provider.defaultProps = {
	// bla: 'test',
};

export { AppContext, Provider };

export default Provider;
