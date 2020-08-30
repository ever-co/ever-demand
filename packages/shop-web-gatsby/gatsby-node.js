const path = require(`path`);

exports.createPages = ({ graphql, actions }) => {
	const { createPage } = actions;
	const ProductDetails = path.resolve(`src/templates/ProductDetails/index.ts`);
	return graphql(
		`
			query loadPagesQuery {
				ever {
					products {
						id
					}
				}
			}
		`,
		{ limit: 99999 },
	).then((result) => {
		if (result.errors) {
			throw result.errors;
		}

		// Create blog post pages.
		result.data.ever.products.forEach((product) => {
			createPage({
				// Path for this page — required
				path: `${product.id}`,
				component: ProductDetails,
				context: {
					// Add optional context data to be inserted
					// as props into the page component..
					//
					// The context data can also be used as
					// arguments to the page GraphQL query.
					//
					// The page "path" is always available as a GraphQL
					// argument.
					id: product.id,
				},
			});
		});
	});
};
