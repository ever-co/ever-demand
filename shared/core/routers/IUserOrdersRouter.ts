import Order from '../entities/Order';
import { Observable } from 'rxjs';
import User from '@modules/server.common/entities/User';

interface IUserOrdersRouter {
	get(userId: User['id']): Observable<Order[]>;
}

export default IUserOrdersRouter;
