import { gql } from '../gql';

export const GeoLocationProductsByPaging = gql(`
	query GeoLocationProductsByPaging(
		$geoLocation: GeoLocationFindInput!
		$options: GetGeoLocationProductsOptions
		$pagingOptions: PagingOptionsInput
		$searchText: String
	) {
		geoLocationProductsByPaging(
			geoLocation: $geoLocation
			options: $options
			pagingOptions: $pagingOptions
			searchText: $searchText
		) {
			distance
			warehouseId
			warehouseLogo
			warehouseProduct {
				id
				price
				initialPrice
				count
				soldCount

				product {
					id
					title {
						locale
						value
					}
					description {
						locale
						value
					}
					details {
						locale
						value
					}
					images {
						locale
						url
						width
						height
						orientation
					}
				}
				isManufacturing
				isCarrierRequired
				isDeliveryRequired
				isTakeaway
				deliveryTimeMin
				deliveryTimeMax
			}
		}
	}
`);

export const ProductQuery = gql(`
	query Product($id: String!) {
		product(id: $id) {
			id
			title {
				locale
				value
			}
			description {
				locale
				value
			}
			descriptionHTML {
				locale
				value
			}
			details {
				locale
				value
			}
			images {
				locale
				url
				width
				height
				orientation
			}
			categories
		}
	}
`);
