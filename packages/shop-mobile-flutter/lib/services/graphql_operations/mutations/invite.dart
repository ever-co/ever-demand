const String createInviteByLocationMutation = r'''
	mutation createInviteByLocationMutation($createInput: InviteCreateInput!) {
		createInvite(createInput: $createInput) {
			id
			code
			apartment
			geoLocation {
				id
				createdAt
				updatedAt
				countryId
				countryName
				city
				streetAddress
				house
				postcode
				notes
				coordinates {
					lng
					lat
				}
			}
		}
	}
''';
