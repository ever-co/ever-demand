import { Injectable } from '@angular/core';
import Invite from '@modules/server.common/entities/Invite';
import IEnterByCode from '@modules/server.common/interfaces/IEnterByCode';
import { Country } from '@modules/server.common/entities/GeoLocation';
import { faker } from '@faker-js/faker';
import { IUserRegistrationInput } from '@modules/server.common/routers/IUserAuthRouter';
import { environment } from '../../../../environments/environment';

@Injectable()
export default class FakeDataUsers {
	getUserRegistrationInput(): IUserRegistrationInput {
		return {
			user: {
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				email: faker.internet.email(),
				phone: faker.phone.number(),
				image: faker.image.avatar(),
				apartment: faker.number.int(199).toString(),
				geoLocation: {
					countryId: faker.number.int(200) as Country,
					city: faker.location.city(),
					postcode: faker.location.zipCode(),
					notes: faker.lorem.text(),
					streetAddress: faker.location.streetAddress(),
					house: faker.number.int(199).toString(),
					loc: {
						type: 'Point',
						coordinates: [
							environment.DEFAULT_LONGITUDE,
							environment.DEFAULT_LATITUDE,
						],
					},
				},
				isBanned: Math.random() < 0.01,
			},
			password: '123456',
		};
	}

	getEnterByCodeToken1(invite: Invite): IEnterByCode {
		return {
			location: invite.geoLocation.loc,
			inviteCode: invite.code,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
		};
	}
}
