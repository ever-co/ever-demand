import { DBObject, ModelName, Schema, Types } from '../@pyro/db';
import IProduct, {
	IProductCreateObject,
	IProductDescription,
	IProductDescriptionHTML,
	IProductDetails,
	IProductDetailsHTML,
	IProductImage,
	IProductTitle,
} from '../interfaces/IProduct';
import ProductsCategory from './ProductsCategory';
import { IProductsCategory } from '../interfaces/IProductsCategory';
import { Entity, Column } from 'typeorm';

/**
 * Product Information (organized as a global Products Catalog)
 *
 * Note: Products in specific warehouse are stored as a WarehouseProduct records instead
 * (in MongoDB as sub-documents of the Warehouse document)
 *
 * @class Product
 * @extends {DBObject<IProduct, IProductCreateObject>}
 * @implements {IProduct}
 */
@ModelName('Product')
@Entity({ name: 'products' })
class Product extends DBObject<IProduct, IProductCreateObject>
	implements IProduct {
	/**
	 * Title of Product (normally short and display as a bold text)
	 *
	 * @type {IProductTitle[]}
	 * @memberof Product
	 */
	@Schema({ type: Array })
	title: IProductTitle[];

	/**
	 * Short description of the product (normally longer than title)
	 *
	 * @type {IProductDescription[]}
	 * @memberof Product
	 */
	@Schema({ type: Array })
	description: IProductDescription[];

	/**
	 * HTML content for Short description of the product (normally longer than title)
	 *
	 * @type {IProductDescriptionHTML[]}
	 * @memberof Product
	 */
	@Schema({ type: Array })
	descriptionHTML: IProductDescriptionHTML[];

	/**
	 * Long description of the product (normally longer than product description)
	 *
	 * @type {IProductDetails[]}
	 * @memberof Product
	 */
	@Schema({ type: Array })
	details: IProductDetails[];

	/**
	 * HTML content for Long description of the product (normally longer than product description)
	 *
	 * @type {IProductDetailsHTML[]}
	 * @memberof Product
	 */
	@Schema({ type: Array })
	detailsHTML: IProductDetailsHTML[];

	/**
	 * Product Images
	 *
	 * @type {IProductImage[]}
	 * @memberof Product
	 */
	@Schema({ type: Array })
	images: IProductImage[];

	/**
	 * Categories to which product belong
	 *
	 * @type {IProductsCategory[]}
	 * @memberof Product
	 */
	@Types.Ref([ProductsCategory])
	categories: IProductsCategory[];

	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
}

export default Product;
