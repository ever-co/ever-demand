require('dotenv').config({
	path: `.env.${process.env.NODE_ENV}`,
});
process.env.DEFAULT_LATITUDE = parseFloat(process.env.DEFAULT_LATITUDE);
process.env.DEFAULT_LONGITUDE = parseFloat(process.env.DEFAULT_LONGITUDE);
module.exports = {
	siteMetadata: {
		title: `Gatsby Ever Starter`,
		description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
		author: `@gatsbyjs`,
	},
	plugins: [
		{
			resolve: `gatsby-plugin-material-ui`,
			// If you want to use styled components, in conjunction to Material-UI, you should:
			// - Change the injection order
			// - Add the plugin
			options: {
				stylesProvider: {
					injectFirst: true,
				},
			},
		},

		'gatsby-plugin-styled-components',
		`gatsby-plugin-react-helmet`,
		`gatsby-plugin-typescript`,
		`gatsby-plugin-sass`,
		{
			resolve: 'gatsby-source-graphql',
			options: {
				// This type will contain remote schema Query type
				typeName: 'Ever',
				// This is field under which it's accessible
				fieldName: 'ever',
				// Url to query from
				url: process.env.GQL_ENDPOINT || 'http://localhost:8000/___graphql',
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `images`,
				path: `${__dirname}/src/images`,
			},
		},
		`gatsby-transformer-sharp`,
		`gatsby-plugin-sharp`,
		{
			resolve: `gatsby-plugin-manifest`,
			options: {
				name: `gatsby-starter-default`,
				short_name: `starter`,
				start_url: `/`,
				background_color: `#663399`,
				theme_color: `#663399`,
				display: `minimal-ui`,
				icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
			},
		},
		// this (optional) plugin enables Progressive Web App + Offline functionality
		// To learn more, visit: https://gatsby.dev/offline
		// 'gatsby-plugin-offline',
	],
};
