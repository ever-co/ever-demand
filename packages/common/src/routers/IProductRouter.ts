import { Observable } from 'rxjs';
import IProduct from '../interfaces/IProduct';
import Product from '../entities/Product';
import { CreateObject } from '@pyro/db/db-create-object';
import { UpdateObject } from '@pyro/db/db-update-object';

interface IProductRouter {
	get(id: Product['id']): Observable<Product | null>;

	create(product: CreateObject<Product>): Promise<Product>;

	update(
		id: Product['id'],
		updateObject: UpdateObject<Product>
	): Promise<Product>;

	save(updatedProduct: IProduct): Promise<Product>;
}

export default IProductRouter;
