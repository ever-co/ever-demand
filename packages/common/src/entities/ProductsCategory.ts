import { DBObject, ModelName, Schema, Types } from '../@pyro/db';
import {
	IProductsCategory,
	IProductsCategoryCreateObject,
	IProductsCategoryName,
} from '../interfaces/IProductsCategory';
import { Entity, Column } from 'typeorm';

/**
 * Product Category
 *
 * @class ProductsCategory
 * @extends {DBObject<IProductsCategory, IProductsCategoryCreateObject>}
 * @implements {IProductsCategory}
 */
@ModelName('ProductCategory')
@Entity({ name: 'productcategories' })
class ProductsCategory
	extends DBObject<IProductsCategory, IProductsCategoryCreateObject>
	implements IProductsCategory {
	/**
	 * Product Category Name
	 *
	 * @type {IProductsCategoryName[]}
	 * @memberof ProductsCategory
	 */
	@Schema({ type: Array })
	name: IProductsCategoryName[];

	/**
	 * Product Category Image URL (optional)
	 *
	 * @type {string}
	 * @memberof ProductsCategory
	 */
	@Schema({
		type: String,
		required: false,
	})
	@Column()
	image: string;

	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
}

export default ProductsCategory;
