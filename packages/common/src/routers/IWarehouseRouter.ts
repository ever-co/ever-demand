import { Observable } from 'rxjs';
import Warehouse from '../entities/Warehouse';
import { IGeoLocationCreateObject } from '../interfaces/IGeoLocation';
import { CreateObject } from '@pyro/db/db-create-object';

export interface IWarehouseRegistrationInput {
	warehouse: CreateObject<Warehouse>;
	password: string;
}

export interface IWarehouseLoginResponse {
	warehouse: Warehouse;
	token: string;
}

interface IWarehouseRouter {
	login(
		username: string,
		password: string
	): Promise<IWarehouseLoginResponse | null>;

	get(id: string, fullProducts?: boolean): Observable<Warehouse | null>;

	getAllActive(fullProducts?: boolean): Observable<Warehouse[]>;

	register(input: IWarehouseRegistrationInput): Promise<Warehouse>;

	updatePassword(
		id: Warehouse['id'],
		password: { current?: string; new: string }
	): Promise<void>;

	updateGeoLocation(
		warehouseId: string,
		geoLocation: IGeoLocationCreateObject
	): Promise<Warehouse>;

	updateAvailability(
		warehouseId: string,
		isAvailable: boolean
	): Promise<Warehouse>;

	save(warehouse: Warehouse): Promise<Warehouse>;
}

export default IWarehouseRouter;
