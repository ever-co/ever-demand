import React from 'react';
import PropTypes from 'prop-types';
import styles from './login.module.scss';
import { Container, Grid, Box } from '@material-ui/core';
// import Map from '../Map'

const Header = ({ title, subtitle, logo }) => {
	return (
		<Box width={1} m={4}>
			<Grid
				container
				alignItems={'center'}
				alignContent={'center'}
				justify={'center'}
				className={styles.content + styles.auth}
				direction={'column'}
			>
				<Grid item>
					<img src={logo} />
				</Grid>
				<Grid item>
					<h2 className={styles.title}>{title}</h2>
				</Grid>
				<Grid item>
					<h2 className={styles.slogan + styles.locationSlogan}>{subtitle}</h2>
				</Grid>
			</Grid>
		</Box>
	);
};

Header.propTypes = {
	// bla: PropTypes.string,
};

Header.defaultProps = {
	// bla: 'test',
};

export default Header;
