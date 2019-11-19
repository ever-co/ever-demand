import { Observable } from 'rxjs';
import ProductsCategory from '../entities/ProductsCategory';
import { CreateObject } from '@pyro/db/db-create-object';
import { UpdateObject } from '@pyro/db/db-update-object';

interface IProductsCategoryRouter {
	get(id: ProductsCategory['id']): Observable<ProductsCategory | null>;

	create(
		createInput: CreateObject<ProductsCategory>
	): Promise<ProductsCategory>;

	update(
		id: ProductsCategory['id'],
		updateInput: UpdateObject<ProductsCategory>
	): Promise<ProductsCategory>;

	remove(id: ProductsCategory['id']): Promise<void>;
}

export default IProductsCategoryRouter;
