import React, { type ReactNode } from 'react';
import { Box, Container } from '@mui/material';

import NavBar from './NavBar';
import './style.scss';
import * as styles from '../styles/styles.module.scss';
import { siteMetadata } from '../site';

/** Page frame: the navigation bar, the page and the footer. */
const Layout = ({ children }: { children?: ReactNode }) => (
	<>
		<NavBar siteTitle={siteMetadata.title} />
		<Container maxWidth={'xl'} className={styles.content}>
			<Box sx={{ mt: 2 }}>
				<main>{children}</main>
				<Box
					component="footer"
					sx={{
						display: 'flex',
						justifyContent: 'center',
						textAlign: 'center',
						mt: 3,
					}}
				>
					© {new Date().getFullYear()}, Built with{` `}
					<a href="https://www.ever.co">Ever</a>
				</Box>
			</Box>
		</Container>
	</>
);

export default Layout;
