import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { createContext, useState } from 'react';
import * as auth from '../auth';
import { navigate } from 'gatsby';
import { ThemeProvider } from '@material-ui/styles';
import theme from '../theme';

const AppContext = createContext(null);

const Provider = ({ children, ...props }) => {
	const [coordinates, setCoordinates] = useState(null);
	
	const [deliveryOnly, setDeliveryOnly] = useState(false);
	
	const user = auth.getUser();

	const getLocation = () => {
		if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
			navigator.geolocation.getCurrentPosition(
				pos => {
					setCoordinates([pos.coords.latitude, pos.coords.longitude]);
				},
				positionError => console.log(positionError),
			);
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
				setDeliveryOnly
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
