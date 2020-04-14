import { graphql, StaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

import NavBar from './NavBar';
import './style.scss';
import { Box, Container } from '@material-ui/core';
import styles from '../styles/styles.module.scss';

/**
 * Layout component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */
const Layout = ({ children }) => (
	<StaticQuery
		query={graphql`
			query SiteTitleQuery {
				site {
					siteMetadata {
						title
					}
				}
			}
		`}
		render={(data) => (
			<>
				<NavBar siteTitle={data.site.siteMetadata.title} />
				<Container maxWidth={'xl'} className={styles.content}>
					<Box mt={2}>
						<main>{children}</main>
						<Box
							display={'flex'}
							justifyContent={'center'}
							textAlign={'center'}
							mt={3}
						>
							<footer>
								© {new Date().getFullYear()}, Built with
								{` `}
								<a href="https://www.ever.co">Ever</a>
							</footer>
						</Box>
					</Box>
				</Container>
			</>
		)}
	/>
);

Layout.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Layout;
