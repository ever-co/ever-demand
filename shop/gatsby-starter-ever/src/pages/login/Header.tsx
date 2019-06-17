import React from 'react';
import PropTypes from 'prop-types';
import styles from './login.module.scss';
import {Grid} from '@material-ui/core';
// import Map from '../Map'

const Header = ({ title, subtitle, logo }) => {
	return (
		<Grid container justify={'center'} className={styles.content + styles.auth} direction={'column'}>
			<Grid item className={styles.formContent}>
					<img src={logo} />
			</Grid>
			<Grid item>
				<h2 className={styles.title}>{title}</h2>
			</Grid>
			<Grid item>
				<h2 className={styles.slogan + styles.locationSlogan}>{subtitle}</h2>
			</Grid>
		</Grid>
	);
};

Header.propTypes = {
	// bla: PropTypes.string,
};

Header.defaultProps = {
	// bla: 'test',
};

export default Header;
