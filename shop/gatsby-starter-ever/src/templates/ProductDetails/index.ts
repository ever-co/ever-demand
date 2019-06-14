import ProductDetails from './ProductDetails';
import { graphql } from 'gatsby';

export default ProductDetails;

export const pageQuery = () => graphql`
	fragment productFragment on Ever_Product {
		descriptionHTML {
			locale
			value
		}
		title {
			locale
			value
		}
		description {
			locale
			value
		}
		id
		images {
			locale
			url
			width
			height
			orientation
		}
		categories
		details {
			locale
			value
		}
	}
	query productQuery($id: String!) {
		ever {
			product(id: $id) {
				...productFragment
			}
		}
	}
`;
