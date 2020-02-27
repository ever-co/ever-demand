import { Observable } from 'rxjs';
import ProductCategory from '../entities/ProductsCategory';
import { CreateObject } from '@pyro/db/db-create-object';
import { UpdateObject } from '@pyro/db/db-update-object';

interface IProductsCategoryRouter {
	get(id: ProductCategory['id']): Observable<ProductCategory | null>;

	create(
		createInput: CreateObject<ProductCategory>
	): Promise<ProductCategory>;

	update(
		id: ProductCategory['id'],
		updateInput: UpdateObject<ProductCategory>
	): Promise<ProductCategory>;

	remove(id: ProductCategory['id']): Promise<void>;
}

export default IProductsCategoryRouter;
