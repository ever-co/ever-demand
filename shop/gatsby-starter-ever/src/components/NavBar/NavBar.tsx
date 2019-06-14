import React from 'react';
import PropTypes from 'prop-types';

import Logo from '../../assets/ever-logo.svg'

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {Box, Button, Container, Grid} from "@material-ui/core";
import {Link} from "gatsby";
//import { Test } from './NavBar.styles';
import * as styles from './NavBar.Module.scss';
import {navigate} from "gatsby";

const NavBar = (props) => (
	  <AppBar bgcolor={'primary'} className={styles.toolbar} position={'static'}>

		  <Box component={Toolbar} width={1} className={styles.toolbar} >

				  <Grid container flexGrow={1} spacing={4}>
					  <Grid item>
						  <Link
							  to='/'
						  >
							  <img src={Logo} />
						  </Link>
					  </Grid>
					  <Grid item >
						  <Link to='/orders' style={{color: 'white', textDecoration: 'none'}}>
						  <Typography variant={'h6'} style={{color: 'white'}}>
							   Orders
						  </Typography>
						  </Link>
				 		 </Grid>
					  </Grid>

				  <Button color="inherit" onClick={() => navigate('/settings')}>Settings</Button>
		  </Box>
	  </AppBar>
);

NavBar.propTypes = {
  // bla: PropTypes.string,
};

NavBar.defaultProps = {
  // bla: 'test',
};

export default NavBar;
