/**
 * The product feed of the Ionic `ProductsPage.loadProducts` (feature inventory §4.4): count first,
 * then pages of 10 polled every 2 s. The first poll result of a page is appended; later polls only
 * update `soldOut` on rows already shown.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Subscription } from 'rxjs';
import { DeliveryType } from '../domain/enums';
import type { Location, ProductInfo } from '../domain/types';
import { useServices } from '../services/container';
import { openOrderWarehouse } from '../services/orders';
import { useAppStore } from '../store';

export const PAGE_SIZE = 10;

export interface ProductFeed {
	products: ProductInfo[];
	productsCount: number;
	loaded: boolean;
	/** Loads the next page (no-op when everything is loaded or a load runs). */
	loadMore: () => Promise<void>;
	/** Drops every row and starts again (delivery type or store mode changed). */
	reset: () => void;
	markSoldOut: (warehouseProductId: string) => void;
}

export function useProductFeed(options: {
	location: Location | null;
	deliveryType: DeliveryType;
	inStore: string | null;
	imageOrientation: number;
	locale: string;
}): ProductFeed {
	const services = useServices();
	const store = useAppStore();
	const [products, setProducts] = useState<ProductInfo[]>([]);
	const [productsCount, setProductsCount] = useState(0);
	const [loaded, setLoaded] = useState(false);

	const productsRef = useRef<ProductInfo[]>([]);
	const subscriptions = useRef<Subscription[]>([]);
	const loading = useRef(false);
	const generation = useRef(0);

	const setRows = (rows: ProductInfo[]) => {
		productsRef.current = rows;
		setProducts(rows);
	};

	const stopAll = () => {
		subscriptions.current.forEach((s) => s.unsubscribe());
		subscriptions.current = [];
	};

	useEffect(() => stopAll, []);

	const { location, deliveryType, inStore, imageOrientation, locale } = options;

	const loadMore = useCallback(async () => {
		if (!location || loading.current) {
			return;
		}
		loading.current = true;
		const run = generation.current;

		try {
			let merchantIds = services.env.MERCHANT_IDS;
			if (merchantIds.length === 0 && inStore) {
				merchantIds = [inStore];
			}
			if (merchantIds.length === 0 && store.getState().session.orderId) {
				const warehouseId = await openOrderWarehouse({
					routers: services.routers,
					graphql: services.graphql,
					store,
					shoppingCart: services.env.SHOPPING_CART,
				});
				if (warehouseId) {
					merchantIds = [warehouseId];
				}
			}

			const geoLocation = { loc: location };
			const queryOptions = {
				isDeliveryRequired: deliveryType === DeliveryType.Delivery,
				isTakeaway: deliveryType === DeliveryType.Takeaway,
				merchantIds,
				imageOrientation,
				locale,
				withoutCount: true,
			};

			const count = await services.graphql.countGeoLocationProducts(geoLocation, queryOptions);
			if (run !== generation.current) {
				return;
			}
			setProductsCount(count);

			if (count <= productsRef.current.length) {
				setLoaded(true);
				return;
			}

			setLoaded(false);
			await new Promise<void>((resolve) => {
				let first = true;
				const subscription = services.graphql
					.watchGeoLocationProducts(
						geoLocation,
						{ skip: productsRef.current.length, limit: PAGE_SIZE },
						queryOptions,
					)
					.subscribe({
						next: (rows) => {
							if (run !== generation.current) {
								return;
							}
							if (first) {
								first = false;
								const known = new Set(productsRef.current.map((p) => p.warehouseProduct.id));
								setRows([
									...productsRef.current,
									...rows.filter((row) => !known.has(row.warehouseProduct.id)).map((row) => ({ ...row })),
								]);
								setLoaded(true);
								resolve();
								return;
							}
							const counts = new Map(rows.map((row) => [row.warehouseProduct.id, row.warehouseProduct.count]));
							let changed = false;
							const next = productsRef.current.map((row) => {
								if (!counts.has(row.warehouseProduct.id)) {
									return row;
								}
								const soldOut = counts.get(row.warehouseProduct.id) === 0;
								if (!!row.soldOut === soldOut) {
									return row;
								}
								changed = true;
								return { ...row, soldOut };
							});
							if (changed) {
								setRows(next);
							}
						},
						error: (error) => {
							console.warn('Could not load the products', error);
							setLoaded(true);
							resolve();
						},
					});
				subscriptions.current.push(subscription);
			});
		} catch (error) {
			console.warn('Could not load the products', error);
			setLoaded(true);
		} finally {
			loading.current = false;
		}
	}, [deliveryType, imageOrientation, inStore, locale, location, services, store]);

	const reset = useCallback(() => {
		generation.current += 1;
		loading.current = false;
		stopAll();
		setRows([]);
		setProductsCount(0);
		setLoaded(false);
	}, []);

	const markSoldOut = useCallback((warehouseProductId: string) => {
		setRows(
			productsRef.current.map((row) =>
				row.warehouseProduct.id === warehouseProductId ? { ...row, soldOut: true } : row,
			),
		);
	}, []);

	return { products, productsCount, loaded, loadMore, reset, markSoldOut };
}
