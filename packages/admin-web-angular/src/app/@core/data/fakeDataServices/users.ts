import { Injectable } from '@angular/core';
import Invite from '@modules/server.common/entities/Invite';
import IEnterByCode from '@modules/server.common/interfaces/IEnterByCode';
import { Country } from '@modules/server.common/entities/GeoLocation';
import faker from 'faker';
import { IUserRegistrationInput } from '@modules/server.common/routers/IUserAuthRouter';
import { environment } from '../../../../environments/environment';

@Injectable()
export default class FakeDataUsers {
	getUserRegistrationInput(): IUserRegistrationInput {
		return {
			user: {
				firstName: faker.name.firstName(),
				lastName: faker.name.lastName(),
				email: faker.internet.email(),
				phone: faker.phone.phoneNumber(),
				image: faker.image.avatar(),
				apartment: faker.random.number(199).toString(),
				geoLocation: {
					countryId: faker.random.number(200) as Country,
					city: faker.address.city(),
					postcode: faker.address.zipCode(),
					streetAddress: faker.address.streetAddress(),
					house: faker.random.number(199).toString(),
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
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
		};
	}
}
