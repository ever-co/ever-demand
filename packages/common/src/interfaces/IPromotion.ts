import { ILocaleMember } from './ILocale';
import Product from '../entities/Product';
import { DBRawObject, PyroObjectId, DBCreateObject } from '@pyro/db';

export interface IPromotionCreateObject extends DBCreateObject {
	/**
	 * Promotion title locale
	 *
	 * @type {string}
	 * @memberof IPromotionCreateObject
	 */
	title: string;

	/**
	 * Promotion description locale
	 *
	 * @type {string}
	 * @memberof IPromotionCreateObject
	 */
	description: string;

	/**
	 *
	 * @type {boolean}
	 * @memberof IPromotionCreateObject
	 */
	active: boolean;

	/**
	 * @type {Date}
	 * @memberof IPromotionCreateObject
	 */
	activeFrom: Date;

	/**
	 * @type {Date}
	 * @memberof IPromotionCreateObject
	 */
	activeTo: Date;

	/**
	 * Url to Promotion picture/photo
	 *
	 * @type {string}
	 * @memberof IPromotionCreateObject
	 */
	image: string;

	//tstodo
	// /**
	//  * @type {Product}
	//  * @memberof IPromotionCreateObject
	//  */
	// product: Product;

	/**
	 * @type {number}
	 * @memberof IPromotionCreateObject
	 */
	purchasesCount: number;
}

export interface IPromotion extends IPromotionCreateObject, DBRawObject {
	_id: PyroObjectId;
}

//tstodo ^^
export interface IPromotionDescription extends ILocaleMember {}
export interface IPromotionTitle extends ILocaleMember {}
