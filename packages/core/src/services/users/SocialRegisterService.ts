import { inject, injectable } from 'inversify';
import { UsersService } from './UsersService';
import { routerName } from '@pyro/io';
import IService from 'services/IService';

@routerName('social-register-service')
@injectable()
export class SocialRegisterService implements IService {
	constructor(@inject(UsersService) protected usersService: UsersService) {}

	async register(profileInfo: object): Promise<{ redirectUrl: string }> {
		const socialId = profileInfo['id'];

		const currentUser = await this.usersService.getSocial(socialId);

		let redirectUrl = '';

		if (currentUser) {
			currentUser.isRegistrationCompleted
				? (redirectUrl = 'login/socie/' + currentUser['_id'])
				: (redirectUrl = 'login/byLocation/' + currentUser['_id']);
		} else {
			const [firstname, lastname] = profileInfo['displayName'].split(' ');

			const email = profileInfo['emails'][0]['value'];

			const socialIdOnProfile = profileInfo['id'];

			const newUser = await this.usersService.initUser({
				firstName: firstname,
				lastName: lastname,
				email,
				socialIds: [socialIdOnProfile],
				isRegistrationCompleted: false,
			});

			redirectUrl = 'login/byLocation/' + newUser['_id'];
		}

		return { redirectUrl };
	}
}
