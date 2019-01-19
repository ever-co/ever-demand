import Carrier from '../entities/Carrier';
import { Observable } from 'rxjs';
import ICarrier from '../interfaces/ICarrier';
import GeoLocation from '../entities/GeoLocation';
import { CreateObject } from '@pyro/db/db-create-object';

export interface ICarrierRegistrationInput {
	carrier: CreateObject<Carrier>;
	password: string;
}

export interface ICarrierLoginResponse {
	carrier: Carrier;
	token: string;
}

interface ICarrierRouter {
	login(
		username: string,
		password: string
	): Promise<ICarrierLoginResponse | null>;

	get(id: Carrier['id']): Observable<Carrier | null>;

	getAllActive(): Observable<Carrier[]>;

	updateStatus(carrierId: Carrier['id'], newStatus: number): Promise<Carrier>;

	updateActivity(
		carrierId: Carrier['id'],
		activity: boolean
	): Promise<Carrier>;

	updateGeoLocation(
		carrierId: Carrier['id'],
		geoLocation: GeoLocation
	): Promise<Carrier>;

	register(input: ICarrierRegistrationInput): Promise<Carrier>;

	updatePassword(
		id: Carrier['id'],
		password: { current?: string; new: string }
	): Promise<void>;

	updateById(
		id: Carrier['id'],
		updateObject: Partial<ICarrier>
	): Promise<Carrier>;
}

export default ICarrierRouter;
