const String registerUserMutation = r'''
	mutation RegisterUser($registerInput: UserRegisterInput!) {
		registerUser(registerInput: $registerInput) {
			firstName
			lastName
			phone
			id
			apartment
			image
			createdAt
			fullAddress
			email
			geoLocation {
				city
				countryName
				streetAddress
				house
			}
			isBanned
		}
	}
''';

const String userLoginMutation = r'''
	mutation UserLogin($password: String!, $email: String!) {
		userLogin(password: $password, email: $email) {
			user {
				id
				geoLocation {
					createdAt
					id
					updatedAt
					countryName
					city
					countryId
					streetAddress
					postcode
					house
					notes
					loc {
						type
						coordinates
					}
					coordinates {
						lng
						lat
					}
				}
				apartment
				firstName
				lastName
				email
				phone
				devicesIds
				devices {
					language
					uuid
					type
					channelId
					id
				}
				image
				fullAddress
				createdAt
				isBanned
			}
			token
		}
	}
''';
