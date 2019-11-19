import Order from '../entities/Order';
import { Observable } from 'rxjs';
import User from '../entities/User';

interface IUserOrdersRouter {
	get(userId: User['id']): Observable<Order[]>;
}

export default IUserOrdersRouter;
