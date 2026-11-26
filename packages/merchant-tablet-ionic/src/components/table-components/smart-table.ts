import type { Cell } from 'angular2-smart-table';

/**
 * The cell inputs a custom renderer gets. ng2-smart-table exported this as `ViewCell`; its
 * maintained fork angular2-smart-table no longer does.
 */
export interface ViewCell {
	value: any;
	rowData: any;
}

/**
 * Since angular2-smart-table 3, a custom renderer only gets data through the column's
 * `componentInitFunction`. This sets `value` and `rowData` like ng2-smart-table did, then runs
 * the column's own initializer, if any.
 */
export function bindViewCell<T = any>(
	init?: (instance: T, cell: Cell) => void
): (instance: T, cell: Cell) => void {
	return (instance: T, cell: Cell) => {
		const view = instance as unknown as ViewCell;
		view.value = cell.getValue();
		view.rowData = cell.getRow().getData();
		init?.(instance, cell);
	};
}
