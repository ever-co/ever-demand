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

	// The write listeners below take the store's own login token (or an admin
	// login token) and refuse any other caller.
	updateGeoLocation(
		warehouseId: string,
		geoLocation: IGeoLocationCreateObject,
		token: string
	): Promise<Warehouse>;

	updateAvailability(
		warehouseId: string,
		isAvailable: boolean,
		token: string
	): Promise<Warehouse>;

	save(warehouse: Warehouse, token: string): Promise<Warehouse>;
}

export default IWarehouseRouter;
