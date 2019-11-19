import { Observable } from 'rxjs';
import User from '../entities/User';
import Device from '../entities/Device';

interface IUserProductsRouter {
	getPlaceholder(
		userId: User['id'],
		deviceId: Device['id']
	): Observable<string>;
}

export default IUserProductsRouter;
