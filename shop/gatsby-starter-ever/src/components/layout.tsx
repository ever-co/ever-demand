import { graphql, StaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

import Header from './header';
import './style.scss';

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
        render={data => (
            <>
              <Header siteTitle={data.site.siteMetadata.title} />
              <div
                  style={{
                    margin: `0 auto`,
                    maxWidth: `1024px`,
                    padding: `0px 1.0875rem 1.45rem`,
                    paddingTop: 0,
                  }}
              >
                <main>{children}</main>
                <footer>
                  © {new Date().getFullYear()}, Built with
                  {` `}
                  <a href='https://www.ever.co'>Ever</a>
                </footer>
              </div>
            </>
        )}
    />
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
