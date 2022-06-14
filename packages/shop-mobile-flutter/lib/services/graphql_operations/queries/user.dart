const String getUser = r'''
	query GetUser($id: String!) {
		user(id: $id) {
			apartment
			geoLocation {
				countryId
				countryName
				postcode
				city
				streetAddress
			}
		}
	}
''';
