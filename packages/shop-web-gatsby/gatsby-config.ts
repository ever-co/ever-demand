import type { GatsbyConfig } from 'gatsby';
import { siteMetadata } from './src/site';

/**
 * The shop fetches its data in the browser (Apollo client, see src/apollo), so `gatsby build`
 * needs no running API. Endpoints come from GATSBY_* env vars (src/config.ts); Gatsby reads
 * them from the environment or from .env.development / .env.production.
 */
const config: GatsbyConfig = {
	siteMetadata,
	plugins: [
		// Server-side rendering of the MUI (emotion) styles
		`gatsby-plugin-emotion`,
		`gatsby-plugin-styled-components`,
		{
			resolve: `gatsby-plugin-sass`,
			options: {
				sassOptions: {
					// Bulma's own deprecation warnings, and sass-loader's legacy API
					quietDeps: true,
					silenceDeprecations: ['legacy-js-api', 'if-function'],
				},
			},
		},
		{
			resolve: `gatsby-plugin-manifest`,
			options: {
				name: `Ever Shop`,
				short_name: `Ever`,
				start_url: `/`,
				background_color: `#2a2c39`,
				theme_color: `#2a2c39`,
				display: `minimal-ui`,
				icon: `src/assets/icon/android-icon-192x192.png`,
			},
		},
	],
};

export default config;
