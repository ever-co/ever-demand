import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';
import { IProductsCategory } from './IProductsCategory';
import { ILocaleMember } from './ILocale';

export interface IProductCreateObject extends DBCreateObject {
	title: IProductTitle[];
	images: IProductImage[];
	details?: IProductDetails[];
	detailsHTML?: IProductDetailsHTML[];
	description: IProductDescription[];
	categories?: IProductsCategory[];
	descriptionHTML?: IProductDescriptionHTML[];
}

interface IProduct extends IProductCreateObject, DBRawObject {
	_id: PyroObjectId;
	descriptionHTML: IProductDescriptionHTML[];
	detailsHTML: IProductDetailsHTML[];
	categories: IProductsCategory[];
}

export interface IProductImage extends ILocaleMember {
	url: string;
	width: number;
	height: number;
	orientation: number;
}

export interface IProductTitle extends ILocaleMember {}

export interface IProductDetails extends ILocaleMember {}

export interface IProductDetailsHTML extends ILocaleMember {}

export interface IProductDescription extends ILocaleMember {}

export interface IProductDescriptionHTML extends ILocaleMember {}

export default IProduct;
