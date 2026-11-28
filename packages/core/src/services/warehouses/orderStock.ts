import type Logger from 'bunyan';
import type { WarehousesProductsService } from './WarehousesProductsService';

/**
 * How many items of a product an order line takes from the store's stock.
 */
export interface OrderStockLine {
	productId: string;
	count: number;
}

type StockCounts = Pick<
	WarehousesProductsService,
	'decreaseCount' | 'increaseCount' | 'increaseSoldCount'
>;

/*
 * The database runs without a replica set, so there are no transactions.
 * An order change that takes stock therefore goes: takeOrderStock() for
 * every line, then save the order (putOrderStockBack() when the save
 * fails), and raise the sold counts last with increaseOrderSoldCounts().
 */

/**
 * Takes the products of the order lines out of the store's stock, one
 * line after the other. Each line is one guarded write, so the store
 * refuses a line whose stock ran out since it was checked. Then the
 * lines already taken go back into stock and the refusal is thrown.
 */
export async function takeOrderStock(
	stock: StockCounts,
	log: Logger,
	warehouseId: string,
	lines: OrderStockLine[]
): Promise<void> {
	const taken: OrderStockLine[] = [];

	for (const { productId, count } of lines) {
		log.info(
			{ warehouseId, productId, count },
			'Order remove products call'
		);

		try {
			await stock.decreaseCount(
				warehouseId,
				productId, // what product availability should be decreased
				count // how many to remove
			);
		} catch (err) {
			await putOrderStockBack(stock, log, warehouseId, taken);
			throw err;
		}

		taken.push({ productId, count });

		log.info(
			{ warehouseId, productId, count },
			'Order remove products call succeed'
		);
	}
}

/**
 * Puts the stock of the order lines back (their order was not saved).
 * A line that cannot be put back is logged, and the other lines are
 * still put back: the caller throws the error that stopped the order.
 */
export async function putOrderStockBack(
	stock: StockCounts,
	log: Logger,
	warehouseId: string,
	lines: OrderStockLine[]
): Promise<void> {
	for (const { productId, count } of lines) {
		try {
			await stock.increaseCount(warehouseId, productId, count);
		} catch (err) {
			log.error(
				{ warehouseId, productId, count, err },
				'Order could not put the products back into stock'
			);
		}
	}
}

/**
 * Raises the sold counts of the order lines, once the order holds them.
 */
export async function increaseOrderSoldCounts(
	stock: StockCounts,
	warehouseId: string,
	lines: OrderStockLine[]
): Promise<void> {
	await Promise.all(
		lines.map(({ productId, count }) =>
			stock.increaseSoldCount(warehouseId, productId, count)
		)
	);
}
