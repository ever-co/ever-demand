/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type GeoLocationCreateInput = {
  city: string;
  countryId: number;
  house: string;
  loc: LocInput;
  notes?: string | null | undefined;
  postcode?: string | null | undefined;
  streetAddress: string;
};

export type GeoLocationFindInput = {
  city?: string | null | undefined;
  countryId?: number | null | undefined;
  house?: string | null | undefined;
  loc?: LocInput | null | undefined;
  notes?: string | null | undefined;
  postcode?: string | null | undefined;
  streetAddress?: string | null | undefined;
};

export type GetGeoLocationProductsOptions = {
  imageOrientation?: number | null | undefined;
  isDeliveryRequired?: boolean | null | undefined;
  isTakeaway?: boolean | null | undefined;
  locale?: string | null | undefined;
  merchantIds?: Array<string | null | undefined> | null | undefined;
  withoutCount?: boolean | null | undefined;
};

export type LocInput = {
  coordinates: Array<number>;
  type: string;
};

export type OrderCreateInput = {
  options?: WarehouseOrdersRouterCreateOptions | null | undefined;
  orderType?: number | null | undefined;
  products: Array<OrderProductCreateInput>;
  userId: string;
  warehouseId: string;
};

export type OrderProductCreateInput = {
  comment?: string | null | undefined;
  count: number;
  productId: string;
};

export type PagingOptionsInput = {
  limit?: number | null | undefined;
  skip?: number | null | undefined;
  sort?: PagingSortInput | null | undefined;
};

export type PagingSortInput = {
  field: string;
  sortBy: string;
};

export type UserCreateInput = {
  apartment: string;
  email?: string | null | undefined;
  firstName?: string | null | undefined;
  geoLocation: GeoLocationCreateInput;
  image?: string | null | undefined;
  lastName?: string | null | undefined;
  phone?: string | null | undefined;
};

export type WarehouseOrdersRouterCreateOptions = {
  autoConfirm: boolean;
};

export type PlaceOrderMutationVariables = Exact<{
  createInput: OrderCreateInput;
}>;


export type PlaceOrderMutation = { createOrder: { id: string, updatedAt: string | null, orderNumber: number, status: number | null, totalPrice: number, products: Array<{ isTakeaway: boolean | null, price: number, product: { images: Array<{ url: string }>, description: Array<{ locale: string, value: string }>, details: Array<{ locale: string, value: string }>, title: Array<{ locale: string, value: string }> } }> } };

export type FetchOrdersQueryVariables = Exact<{
  id: string;
}>;


export type FetchOrdersQuery = { getOrders: Array<{ id: string, updatedAt: string | null, orderNumber: number, status: number | null, totalPrice: number, products: Array<{ isTakeaway: boolean | null, price: number, product: { images: Array<{ url: string }>, description: Array<{ locale: string, value: string }>, details: Array<{ locale: string, value: string }>, title: Array<{ locale: string, value: string }> } }> }> };

export type GeoLocationProductsByPagingQueryVariables = Exact<{
  geoLocation: GeoLocationFindInput;
  options?: GetGeoLocationProductsOptions | null | undefined;
  pagingOptions?: PagingOptionsInput | null | undefined;
  searchText?: string | null | undefined;
}>;


export type GeoLocationProductsByPagingQuery = { geoLocationProductsByPaging: Array<{ distance: number, warehouseId: string, warehouseLogo: string, warehouseProduct: { id: string, price: number, initialPrice: number, count: number | null, soldCount: number, isManufacturing: boolean | null, isCarrierRequired: boolean | null, isDeliveryRequired: boolean | null, isTakeaway: boolean | null, deliveryTimeMin: number | null, deliveryTimeMax: number | null, product: { id: string, title: Array<{ locale: string, value: string }>, description: Array<{ locale: string, value: string }>, details: Array<{ locale: string, value: string }>, images: Array<{ locale: string, url: string, width: number, height: number, orientation: number }> } } } | null> };

export type ProductQueryVariables = Exact<{
  id: string;
}>;


export type ProductQuery = { product: { id: string, categories: Array<string | null> | null, title: Array<{ locale: string, value: string }>, description: Array<{ locale: string, value: string }>, descriptionHTML: Array<{ locale: string, value: string }>, details: Array<{ locale: string, value: string }>, images: Array<{ locale: string, url: string, width: number, height: number, orientation: number }> } | null };

export type MakeUserMutationVariables = Exact<{
  user: UserCreateInput;
  password: string;
}>;


export type MakeUserMutation = { registerUser: { id: string } };


export const PlaceOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PlaceOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"createInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isTakeaway"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}}]}}]}}]} as unknown as DocumentNode<PlaceOrderMutation, PlaceOrderMutationVariables>;
export const FetchOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isTakeaway"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}}]}}]}}]} as unknown as DocumentNode<FetchOrdersQuery, FetchOrdersQueryVariables>;
export const GeoLocationProductsByPagingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GeoLocationProductsByPaging"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"geoLocation"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GeoLocationFindInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"options"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetGeoLocationProductsOptions"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagingOptions"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PagingOptionsInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchText"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"geoLocationProductsByPaging"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"geoLocation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"geoLocation"}}},{"kind":"Argument","name":{"kind":"Name","value":"options"},"value":{"kind":"Variable","name":{"kind":"Name","value":"options"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagingOptions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagingOptions"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchText"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchText"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"warehouseId"}},{"kind":"Field","name":{"kind":"Name","value":"warehouseLogo"}},{"kind":"Field","name":{"kind":"Name","value":"warehouseProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"initialPrice"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"soldCount"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"orientation"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isManufacturing"}},{"kind":"Field","name":{"kind":"Name","value":"isCarrierRequired"}},{"kind":"Field","name":{"kind":"Name","value":"isDeliveryRequired"}},{"kind":"Field","name":{"kind":"Name","value":"isTakeaway"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryTimeMin"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryTimeMax"}}]}}]}}]}}]} as unknown as DocumentNode<GeoLocationProductsByPagingQuery, GeoLocationProductsByPagingQueryVariables>;
export const ProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Product"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"descriptionHTML"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"orientation"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"}}]}}]}}]} as unknown as DocumentNode<ProductQuery, ProductQueryVariables>;
export const MakeUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MakeUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserCreateInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"registerInput"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"user"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<MakeUserMutation, MakeUserMutationVariables>;