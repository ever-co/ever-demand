/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
	'\n\tmutation PlaceOrder($createInput: OrderCreateInput!) {\n\t\tcreateOrder(createInput: $createInput) {\n\t\t\tid\n\t\t\tupdatedAt\n\t\t\torderNumber\n\t\t\tstatus\n\t\t\ttotalPrice\n\t\t\tproducts {\n\t\t\t\tisTakeaway\n\t\t\t\tproduct {\n\t\t\t\t\timages {\n\t\t\t\t\t\turl\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tprice\n\t\t\t}\n\t\t}\n\t}\n': typeof types.PlaceOrderDocument;
	'\n\tquery FetchOrders($id: String!) {\n\t\tgetOrders(userId: $id) {\n\t\t\tid\n\t\t\tupdatedAt\n\t\t\torderNumber\n\t\t\tstatus\n\t\t\ttotalPrice\n\t\t\tproducts {\n\t\t\t\tisTakeaway\n\t\t\t\tproduct {\n\t\t\t\t\timages {\n\t\t\t\t\t\turl\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tprice\n\t\t\t}\n\t\t}\n\t}\n': typeof types.FetchOrdersDocument;
	'\n\tquery GeoLocationProductsByPaging(\n\t\t$geoLocation: GeoLocationFindInput!\n\t\t$options: GetGeoLocationProductsOptions\n\t\t$pagingOptions: PagingOptionsInput\n\t\t$searchText: String\n\t) {\n\t\tgeoLocationProductsByPaging(\n\t\t\tgeoLocation: $geoLocation\n\t\t\toptions: $options\n\t\t\tpagingOptions: $pagingOptions\n\t\t\tsearchText: $searchText\n\t\t) {\n\t\t\tdistance\n\t\t\twarehouseId\n\t\t\twarehouseLogo\n\t\t\twarehouseProduct {\n\t\t\t\tid\n\t\t\t\tprice\n\t\t\t\tinitialPrice\n\t\t\t\tcount\n\t\t\t\tsoldCount\n\n\t\t\t\tproduct {\n\t\t\t\t\tid\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\timages {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\turl\n\t\t\t\t\t\twidth\n\t\t\t\t\t\theight\n\t\t\t\t\t\torientation\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tisManufacturing\n\t\t\t\tisCarrierRequired\n\t\t\t\tisDeliveryRequired\n\t\t\t\tisTakeaway\n\t\t\t\tdeliveryTimeMin\n\t\t\t\tdeliveryTimeMax\n\t\t\t}\n\t\t}\n\t}\n': typeof types.GeoLocationProductsByPagingDocument;
	'\n\tquery Product($id: String!) {\n\t\tproduct(id: $id) {\n\t\t\tid\n\t\t\ttitle {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdescription {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdescriptionHTML {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdetails {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\timages {\n\t\t\t\tlocale\n\t\t\t\turl\n\t\t\t\twidth\n\t\t\t\theight\n\t\t\t\torientation\n\t\t\t}\n\t\t\tcategories\n\t\t}\n\t}\n': typeof types.ProductDocument;
	'\n\tmutation MakeUser($user: UserCreateInput!, $password: String!) {\n\t\tregisterUser(registerInput: { user: $user, password: $password }) {\n\t\t\tid\n\t\t}\n\t}\n': typeof types.MakeUserDocument;
};
const documents: Documents = {
	'\n\tmutation PlaceOrder($createInput: OrderCreateInput!) {\n\t\tcreateOrder(createInput: $createInput) {\n\t\t\tid\n\t\t\tupdatedAt\n\t\t\torderNumber\n\t\t\tstatus\n\t\t\ttotalPrice\n\t\t\tproducts {\n\t\t\t\tisTakeaway\n\t\t\t\tproduct {\n\t\t\t\t\timages {\n\t\t\t\t\t\turl\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tprice\n\t\t\t}\n\t\t}\n\t}\n':
		types.PlaceOrderDocument,
	'\n\tquery FetchOrders($id: String!) {\n\t\tgetOrders(userId: $id) {\n\t\t\tid\n\t\t\tupdatedAt\n\t\t\torderNumber\n\t\t\tstatus\n\t\t\ttotalPrice\n\t\t\tproducts {\n\t\t\t\tisTakeaway\n\t\t\t\tproduct {\n\t\t\t\t\timages {\n\t\t\t\t\t\turl\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tprice\n\t\t\t}\n\t\t}\n\t}\n':
		types.FetchOrdersDocument,
	'\n\tquery GeoLocationProductsByPaging(\n\t\t$geoLocation: GeoLocationFindInput!\n\t\t$options: GetGeoLocationProductsOptions\n\t\t$pagingOptions: PagingOptionsInput\n\t\t$searchText: String\n\t) {\n\t\tgeoLocationProductsByPaging(\n\t\t\tgeoLocation: $geoLocation\n\t\t\toptions: $options\n\t\t\tpagingOptions: $pagingOptions\n\t\t\tsearchText: $searchText\n\t\t) {\n\t\t\tdistance\n\t\t\twarehouseId\n\t\t\twarehouseLogo\n\t\t\twarehouseProduct {\n\t\t\t\tid\n\t\t\t\tprice\n\t\t\t\tinitialPrice\n\t\t\t\tcount\n\t\t\t\tsoldCount\n\n\t\t\t\tproduct {\n\t\t\t\t\tid\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\timages {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\turl\n\t\t\t\t\t\twidth\n\t\t\t\t\t\theight\n\t\t\t\t\t\torientation\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tisManufacturing\n\t\t\t\tisCarrierRequired\n\t\t\t\tisDeliveryRequired\n\t\t\t\tisTakeaway\n\t\t\t\tdeliveryTimeMin\n\t\t\t\tdeliveryTimeMax\n\t\t\t}\n\t\t}\n\t}\n':
		types.GeoLocationProductsByPagingDocument,
	'\n\tquery Product($id: String!) {\n\t\tproduct(id: $id) {\n\t\t\tid\n\t\t\ttitle {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdescription {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdescriptionHTML {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdetails {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\timages {\n\t\t\t\tlocale\n\t\t\t\turl\n\t\t\t\twidth\n\t\t\t\theight\n\t\t\t\torientation\n\t\t\t}\n\t\t\tcategories\n\t\t}\n\t}\n':
		types.ProductDocument,
	'\n\tmutation MakeUser($user: UserCreateInput!, $password: String!) {\n\t\tregisterUser(registerInput: { user: $user, password: $password }) {\n\t\t\tid\n\t\t}\n\t}\n':
		types.MakeUserDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
	source: '\n\tmutation PlaceOrder($createInput: OrderCreateInput!) {\n\t\tcreateOrder(createInput: $createInput) {\n\t\t\tid\n\t\t\tupdatedAt\n\t\t\torderNumber\n\t\t\tstatus\n\t\t\ttotalPrice\n\t\t\tproducts {\n\t\t\t\tisTakeaway\n\t\t\t\tproduct {\n\t\t\t\t\timages {\n\t\t\t\t\t\turl\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tprice\n\t\t\t}\n\t\t}\n\t}\n',
): (typeof documents)['\n\tmutation PlaceOrder($createInput: OrderCreateInput!) {\n\t\tcreateOrder(createInput: $createInput) {\n\t\t\tid\n\t\t\tupdatedAt\n\t\t\torderNumber\n\t\t\tstatus\n\t\t\ttotalPrice\n\t\t\tproducts {\n\t\t\t\tisTakeaway\n\t\t\t\tproduct {\n\t\t\t\t\timages {\n\t\t\t\t\t\turl\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tprice\n\t\t\t}\n\t\t}\n\t}\n'];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
	source: '\n\tquery FetchOrders($id: String!) {\n\t\tgetOrders(userId: $id) {\n\t\t\tid\n\t\t\tupdatedAt\n\t\t\torderNumber\n\t\t\tstatus\n\t\t\ttotalPrice\n\t\t\tproducts {\n\t\t\t\tisTakeaway\n\t\t\t\tproduct {\n\t\t\t\t\timages {\n\t\t\t\t\t\turl\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tprice\n\t\t\t}\n\t\t}\n\t}\n',
): (typeof documents)['\n\tquery FetchOrders($id: String!) {\n\t\tgetOrders(userId: $id) {\n\t\t\tid\n\t\t\tupdatedAt\n\t\t\torderNumber\n\t\t\tstatus\n\t\t\ttotalPrice\n\t\t\tproducts {\n\t\t\t\tisTakeaway\n\t\t\t\tproduct {\n\t\t\t\t\timages {\n\t\t\t\t\t\turl\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tprice\n\t\t\t}\n\t\t}\n\t}\n'];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
	source: '\n\tquery GeoLocationProductsByPaging(\n\t\t$geoLocation: GeoLocationFindInput!\n\t\t$options: GetGeoLocationProductsOptions\n\t\t$pagingOptions: PagingOptionsInput\n\t\t$searchText: String\n\t) {\n\t\tgeoLocationProductsByPaging(\n\t\t\tgeoLocation: $geoLocation\n\t\t\toptions: $options\n\t\t\tpagingOptions: $pagingOptions\n\t\t\tsearchText: $searchText\n\t\t) {\n\t\t\tdistance\n\t\t\twarehouseId\n\t\t\twarehouseLogo\n\t\t\twarehouseProduct {\n\t\t\t\tid\n\t\t\t\tprice\n\t\t\t\tinitialPrice\n\t\t\t\tcount\n\t\t\t\tsoldCount\n\n\t\t\t\tproduct {\n\t\t\t\t\tid\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\timages {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\turl\n\t\t\t\t\t\twidth\n\t\t\t\t\t\theight\n\t\t\t\t\t\torientation\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tisManufacturing\n\t\t\t\tisCarrierRequired\n\t\t\t\tisDeliveryRequired\n\t\t\t\tisTakeaway\n\t\t\t\tdeliveryTimeMin\n\t\t\t\tdeliveryTimeMax\n\t\t\t}\n\t\t}\n\t}\n',
): (typeof documents)['\n\tquery GeoLocationProductsByPaging(\n\t\t$geoLocation: GeoLocationFindInput!\n\t\t$options: GetGeoLocationProductsOptions\n\t\t$pagingOptions: PagingOptionsInput\n\t\t$searchText: String\n\t) {\n\t\tgeoLocationProductsByPaging(\n\t\t\tgeoLocation: $geoLocation\n\t\t\toptions: $options\n\t\t\tpagingOptions: $pagingOptions\n\t\t\tsearchText: $searchText\n\t\t) {\n\t\t\tdistance\n\t\t\twarehouseId\n\t\t\twarehouseLogo\n\t\t\twarehouseProduct {\n\t\t\t\tid\n\t\t\t\tprice\n\t\t\t\tinitialPrice\n\t\t\t\tcount\n\t\t\t\tsoldCount\n\n\t\t\t\tproduct {\n\t\t\t\t\tid\n\t\t\t\t\ttitle {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdescription {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tdetails {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\timages {\n\t\t\t\t\t\tlocale\n\t\t\t\t\t\turl\n\t\t\t\t\t\twidth\n\t\t\t\t\t\theight\n\t\t\t\t\t\torientation\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tisManufacturing\n\t\t\t\tisCarrierRequired\n\t\t\t\tisDeliveryRequired\n\t\t\t\tisTakeaway\n\t\t\t\tdeliveryTimeMin\n\t\t\t\tdeliveryTimeMax\n\t\t\t}\n\t\t}\n\t}\n'];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
	source: '\n\tquery Product($id: String!) {\n\t\tproduct(id: $id) {\n\t\t\tid\n\t\t\ttitle {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdescription {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdescriptionHTML {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdetails {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\timages {\n\t\t\t\tlocale\n\t\t\t\turl\n\t\t\t\twidth\n\t\t\t\theight\n\t\t\t\torientation\n\t\t\t}\n\t\t\tcategories\n\t\t}\n\t}\n',
): (typeof documents)['\n\tquery Product($id: String!) {\n\t\tproduct(id: $id) {\n\t\t\tid\n\t\t\ttitle {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdescription {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdescriptionHTML {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\tdetails {\n\t\t\t\tlocale\n\t\t\t\tvalue\n\t\t\t}\n\t\t\timages {\n\t\t\t\tlocale\n\t\t\t\turl\n\t\t\t\twidth\n\t\t\t\theight\n\t\t\t\torientation\n\t\t\t}\n\t\t\tcategories\n\t\t}\n\t}\n'];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
	source: '\n\tmutation MakeUser($user: UserCreateInput!, $password: String!) {\n\t\tregisterUser(registerInput: { user: $user, password: $password }) {\n\t\t\tid\n\t\t}\n\t}\n',
): (typeof documents)['\n\tmutation MakeUser($user: UserCreateInput!, $password: String!) {\n\t\tregisterUser(registerInput: { user: $user, password: $password }) {\n\t\t\tid\n\t\t}\n\t}\n'];

export function gql(source: string) {
	return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
	TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
