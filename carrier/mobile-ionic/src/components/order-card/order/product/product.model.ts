import gql from 'graphql-tag';

export const OrderProductFragment = gql`
	fragment OrderProductFragment on OrderProduct {
		count
		price
		product {
			images {
				locale
				orientation
				url
			}
			title {
				locale
				value
			}
			description {
				locale
				value
			}
		}
	}
`;
