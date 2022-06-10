import type { ScalarsInterface, MaybeType } from '../../types';

export interface QueryGetOrdersArgsInterface {
	userId: ScalarsInterface['String'];
}

export interface WarehouseOrdersRouterCreateOptionsInterface {
	autoConfirm: ScalarsInterface['Boolean'];
}

export interface OrderProductCreateInputInterface {
	count: ScalarsInterface['Int'];
	productId: ScalarsInterface['String'];
}

export interface OrderCreateInputInterface {
	userId: ScalarsInterface['String'];
	warehouseId: ScalarsInterface['String'];
	products: OrderProductCreateInputInterface[];
	options?: MaybeType<WarehouseOrdersRouterCreateOptionsInterface>;
	orderType: ScalarsInterface['Int'];
}

export interface MutationCreateOrderArgsInterface {
	createInput: OrderCreateInputInterface;
}
