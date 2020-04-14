import { Observable } from 'rxjs';
import User from '../entities/User';
import GeoLocation from '../entities/GeoLocation';
import { IUserCreateObject } from '../interfaces/IUser';
import Stripe from 'stripe';
import Device from '../entities/Device';

interface IUserRouter {
	get(id: User['id']): Observable<User | null>;

	updateUser(id: User['id'], user: IUserCreateObject): Promise<User | null>;

	addPaymentMethod(userId: User['id'], tokenId: string): Promise<string>;

	getCards(userId: User['id']): Promise<Stripe.cards.ICard[]>;

	updateEmail(userId: User['id'], email: string): Promise<User>;

	updateGeoLocation(
		userId: User['id'],
		geoLocation: GeoLocation
	): Promise<User>;

	getAboutUs(userId: User['id'], deviceId: Device['id']): Observable<string>;

	getTermsOfUse(
		userId: User['id'],
		deviceId: Device['id']
	): Observable<string>;

	getPrivacy(userId: User['id'], deviceId: Device['id']): Observable<string>;
}

export default IUserRouter;
