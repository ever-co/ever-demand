import * as GoogleStrategy from 'passport-google-oauth20';
import { inject, injectable } from 'inversify';
import * as FacebookStrategy from 'passport-facebook';
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

	public getGoogleStrategy(): GoogleStrategy {
		return new GoogleStrategy(
			{
				clientID: env.GOOGLE_APP_ID,
				clientSecret: env.GOOGLE_APP_SECRET,
				callbackURL: '/auth/google/callback'
			},
			async (accessToken, refreshToken, profile, done) => {
				const { redirectUrl } = await this.socialRegister.register(
					profile
				);

				done(null, { redirectUrl });
			}
		);
	}

	public getFacebookStrategy(): FacebookStrategy {
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
					'gender'
				]
			},
			async (accessToken, refreshToken, profile, done) => {
				const { redirectUrl } = await this.socialRegister.register(
					profile
				);
				done(null, { redirectUrl });
			}
		);
	}
}
