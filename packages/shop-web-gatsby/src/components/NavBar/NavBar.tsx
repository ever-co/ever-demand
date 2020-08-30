import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import Logo from '../../assets/ever-logo.svg';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Box, Button, Grid, Switch, Typography } from '@material-ui/core';
import { Link } from 'gatsby';
//import { Test } from './NavBar.styles';
import styles from './NavBar.module.scss';
import { navigate } from 'gatsby';
import { AppContext } from '../../Context';

const NavBar = (props) => {
	const { deliveryOnly, setDeliveryOnly } = useContext(AppContext);
	return (
		<AppBar bgcolor={'primary'} className={styles.toolbar} position={'static'}>
			<Box component={Toolbar} width={1} className={styles.toolbar}>
				<Grid container flexGrow={1} spacing={2} className={styles.navGrid}>
					<Grid item alignItems={'center'} alignContent={'center'}>
						<Button onClick={() => navigate('/')} className={styles.logo}>
							<img src={Logo} />
						</Button>
					</Grid>
					<Grid item>
						<Link
							to="/orders"
							style={{ color: 'white', textDecoration: 'none' }}
						>
							<Button color={'inherit'}>Orders</Button>
						</Link>
					</Grid>
				</Grid>
				<Typography variant="subtitle2">Takeout</Typography>
				<Switch
					checked={deliveryOnly}
					onChange={() => setDeliveryOnly(deliveryOnly ? false : true)}
					value={deliveryOnly}
				/>

				<Typography variant="subtitle2">Delivery</Typography>
				<Button
					color="inherit"
					onClick={() => navigate('/settings')}
					style={{ marginLeft: '0.8em' }}
				>
					Settings
				</Button>
			</Box>
		</AppBar>
	);
};

NavBar.propTypes = {
	// bla: PropTypes.string,
};

NavBar.defaultProps = {
	// bla: 'test',
};

export default NavBar;
