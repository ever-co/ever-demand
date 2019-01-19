import { Observable } from 'rxjs';
import IGeoLocation from '../interfaces/IGeoLocation';
import ProductInfo from '../entities/ProductInfo';

interface IGeoLocationProductsRouter {
	get(geoLocation: IGeoLocation): Observable<ProductInfo[]>;
}

export default IGeoLocationProductsRouter;
