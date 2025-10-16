import { gql } from 'apollo-angular';

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
