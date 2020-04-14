import { Observable } from 'rxjs';
import User from '../entities/User';
import Warehouse from '../entities/Warehouse';

interface IWarehouseUsersRouter {
	get(warehouseId: Warehouse['id']): Observable<User[]>;
}

export default IWarehouseUsersRouter;
