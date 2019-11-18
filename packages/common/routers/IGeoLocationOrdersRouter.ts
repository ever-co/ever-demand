import { Observable } from 'rxjs';
import Order from '../entities/Order';
import IGeoLocation from '../interfaces/IGeoLocation';

export interface IGeoLocationOrdersRouterGetOptions {
	populateWarehouse?: boolean;
	populateCarrier?: boolean;
}

interface IGeoLocationOrdersRouter {
	get(
		geoLocation: IGeoLocation,
		options?: IGeoLocationOrdersRouterGetOptions
	): Observable<Order[]>;
}

export default IGeoLocationOrdersRouter;
