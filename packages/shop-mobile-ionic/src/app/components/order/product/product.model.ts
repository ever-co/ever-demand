import { gql } from 'apollo-angular';

export const OrderProductFragment = gql`
	fragment OrderProductFragment on OrderProduct {
		count
		price
		isTakeaway
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
