import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';
import { ILocaleMember } from './ILocale';

export interface IProductsCategoryCreateObject extends DBCreateObject {
	name: IProductsCategoryName[];
	image?: string;
}

/**
 * Products category - allows organization (grouping) of the products
 * Categories like "Pizza", "Burgers" and "Sushi" or "Main dishes", "Extras" and "Drinks"
 * Or even "TV", "Car", etc
 */
export interface IProductsCategory
	extends IProductsCategoryCreateObject,
		DBRawObject {
	_id: PyroObjectId;
}

export interface IProductsCategoryName extends ILocaleMember {}
