import { Observable } from 'rxjs';
import Warehouse from '../entities/Warehouse';
import Carrier from '../entities/Carrier';

interface IWarehouseCarriersRouter {
	get(warehouseId: Warehouse['id']): Observable<Carrier[] | null>;
}

export default IWarehouseCarriersRouter;
