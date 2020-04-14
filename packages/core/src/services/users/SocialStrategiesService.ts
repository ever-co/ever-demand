import GoogleStrategy from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';
import { inject, injectable } from 'inversify';
import { SocialRegisterService } from './SocialRegisterService';
import { routerName } from '@pyro/io';
import { env } from '../../env';
import IService from 'services/IService';

@routerName('social-strategies-service')
@injectable()
export class SocialStrategiesService implements IService {
	constructor(
		@inject(SocialRegisterService)
		protected socialRegister: SocialRegisterService
	) {}

	getGoogleStrategy(): GoogleStrategy | null {
		if (env.GOOGLE_APP_ID !== '' && env.GOOGLE_APP_SECRET !== '') {
			return new GoogleStrategy(
				{
					clientID: env.GOOGLE_APP_ID,
					clientSecret: env.GOOGLE_APP_SECRET,
					callbackURL: '/auth/google/callback',
				},
				async (accessToken, refreshToken, profile, done) => {
					const { redirectUrl } = await this.socialRegister.register(
						profile
					);

					done(null, { redirectUrl });
				}
			);
		}

		console.log(
			`Warning: Google OAuth disabled because no details provided in the settings/environment`
		);

		return null;
	}

	getFacebookStrategy(): FacebookStrategy | null {
		if (env.FACEBOOK_APP_ID !== '' && env.FACEBOOK_APP_SECRET !== '') {
			return new FacebookStrategy(
				{
					clientID: env.FACEBOOK_APP_ID,
					clientSecret: env.FACEBOOK_APP_SECRET,
					callbackURL: '/auth/facebook/callback',
					profileFields: [
						'id',
						'displayName',
						'picture',
						'email',
						'gender',
					],
				},
				async (accessToken, refreshToken, profile, done) => {
					const { redirectUrl } = await this.socialRegister.register(
						profile
					);
					done(null, { redirectUrl });
				}
			);
		}

		console.log(
			`Warning: Facebook OAuth disabled because no details provided in the settings/environment`
		);

		return null;
	}
}
