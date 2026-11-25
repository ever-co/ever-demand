import React from 'react';
import {
	AppBar,
	Box,
	Button,
	Switch,
	Toolbar,
	Typography,
} from '@mui/material';
import { Link, navigate } from 'gatsby';

import Logo from '../../assets/ever-logo.svg';
import * as styles from './NavBar.module.scss';
import { useAppContext } from '../../Context';

interface NavBarProps {
	siteTitle?: string;
}

/** Top bar: home, orders, the takeout/delivery switch and the settings. */
const NavBar = ({ siteTitle = '' }: NavBarProps) => {
	const { deliveryOnly, setDeliveryOnly } = useAppContext();

	return (
		<AppBar color="primary" className={styles.toolbar} position={'static'}>
			<Toolbar className={styles.toolbar} sx={{ width: 1 }}>
				<Box
					sx={{ display: 'flex', flexGrow: 1, alignItems: 'center', gap: 2 }}
				>
					<Button
						onClick={() => navigate('/')}
						className={styles.logo}
						aria-label={siteTitle || 'Home'}
					>
						<img src={Logo} alt="" />
					</Button>
					<Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>
						<Button color={'inherit'} component="span">
							Orders
						</Button>
					</Link>
				</Box>
				<Typography variant="subtitle2">Takeout</Typography>
				<Switch
					checked={deliveryOnly}
					onChange={() => setDeliveryOnly(!deliveryOnly)}
					slotProps={{ input: { 'aria-label': 'Delivery only' } }}
				/>
				<Typography variant="subtitle2">Delivery</Typography>
				<Button
					color="inherit"
					onClick={() => navigate('/settings')}
					sx={{ ml: '0.8em' }}
				>
					Settings
				</Button>
			</Toolbar>
		</AppBar>
	);
};

export default NavBar;
