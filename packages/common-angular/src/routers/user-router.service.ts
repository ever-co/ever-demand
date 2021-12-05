import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import { Injectable } from '@angular/core';
import IUserRouter from '@modules/server.common/routers/IUserRouter';
import IUser, {
	IUserCreateObject,
} from '@modules/server.common/interfaces/IUser';
import User from '@modules/server.common/entities/User';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { Stripe } from 'stripe';

@Injectable()
export class UserRouter implements IUserRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('user');
	}

	get(id: string): Observable<User> {
		return this.router
			.runAndObserve<IUser>('get', id)
			.pipe(map((user) => this._userFactory(user)));
	}

	async updateUser(
		id: string,
		userCreateObject: IUserCreateObject
	): Promise<User | any> {
		const user = await this.router.run<IUser>(
			'updateUser',
			id,
			userCreateObject
		);
		return this._userFactory(user);
	}

	addPaymentMethod(
		userId: string,
		tokenId: string
	): Promise<string /*cardId*/> {
		return this.router.run<string>('addPaymentMethod', userId, tokenId);
	}

	getCards(userId: string): Promise<Stripe.Card[]> {
		return this.router.run<Stripe.Card[]>('getCards', userId);
	}

	async updateEmail(userId: string, email: string): Promise<User> {
		const user = await this.router.run<IUser>('updateEmail', userId, email);
		return this._userFactory(user);
	}

	async updateGeoLocation(
		userId: string,
		geoLocation: GeoLocation
	): Promise<User> {
		const user = await this.router.run<IUser>(userId, geoLocation);
		return this._userFactory(user);
	}

	getAboutUs(
		userId: string,
		deviceId: string,
		selectedLanguage: string
	): Observable<string> {
		return this.router.runAndObserve<string>(
			'getAboutUs',
			userId,
			deviceId,
			selectedLanguage
		);
	}

	getTermsOfUse(
		userId: string,
		deviceId: string,
		selectedLanguage: string
	): Observable<string> {
		return this.router.runAndObserve<string>(
			'getTermsOfUse',
			userId,
			deviceId,
			selectedLanguage
		);
	}

	getHelp(
		userId: string,
		deviceId: string,
		selectedLanguage: string
	): Observable<string> {
		return this.router.runAndObserve<string>(
			'getHelp',
			userId,
			deviceId,
			selectedLanguage
		);
	}

	getPrivacy(
		userId: string,
		deviceId: string,
		selectedLanguage: string
	): Observable<string> {
		return this.router.runAndObserve<string>(
			'getPrivacy',
			userId,
			deviceId,
			selectedLanguage
		);
	}

	protected _userFactory(user: IUser) {
		return user == null ? null : new User(user);
	}
}
