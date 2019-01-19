import { Observable } from 'rxjs';
import User from '@modules/server.common/entities/User';
import Device from '@modules/server.common/entities/Device';

interface IUserProductsRouter {
	getPlaceholder(
		userId: User['id'],
		deviceId: Device['id']
	): Observable<string>;
}

export default IUserProductsRouter;
