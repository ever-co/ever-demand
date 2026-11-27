import { Cell, Column, DataSet, Row } from 'angular2-smart-table';
import {
	toSmartTableColumn,
	toSmartTableSettings,
} from './smart-table-settings';

/** A real angular2-smart-table cell for `rowData[columnId]`. */
function cellFor(
	rowData: any,
	columnId: string,
	columnSettings: any = {},
): Cell {
	const dataSet = new DataSet([rowData], { [columnId]: columnSettings });
	const row: Row = dataSet.getRows()[0];
	const column: Column = dataSet.getColumns()[0];
	return row.getCell(column);
}

describe('toSmartTableColumn (ng2-smart-table -> angular2-smart-table settings)', () => {
	it('maps filter: false to isFilterable: false', () => {
		const column = toSmartTableColumn({ title: 'Name', filter: false });
		expect(column.isFilterable).toBe(false);
		expect(column.filter).toBeUndefined();
	});

	it('keeps object filters and replaces the removed completer filter', () => {
		const list = {
			type: 'list',
			config: { list: [{ value: 'a', title: 'A' }] },
		};
		expect(toSmartTableColumn({ filter: list }).filter).toEqual(list);
		expect(
			toSmartTableColumn({ filter: { type: 'completer' } }).filter,
		).toEqual({
			type: 'text',
		});
	});

	it('renames sort / editable / addable flags', () => {
		const column = toSmartTableColumn({
			sort: false,
			editable: false,
			addable: true,
		});
		expect(column).toMatchObject({
			isSortable: false,
			isEditable: false,
			isAddable: true,
		});
		expect(column).not.toHaveProperty('sort');
		expect(column).not.toHaveProperty('editable');
		expect(column).not.toHaveProperty('addable');
	});

	it('puts the old column class on the header', () => {
		expect(toSmartTableColumn({ class: 'text-center' }).classHeader).toBe(
			'text-center',
		);
	});

	it('calls valuePrepareFunction with (value, rowData) like ng2-smart-table', () => {
		const prepare = vi.fn((value, row) => `${value}:${row.name}`);
		const column = toSmartTableColumn({ valuePrepareFunction: prepare });
		const row = { id: 1, name: 'Store 1', qty: 3 };
		const cell = cellFor(row, 'qty', column);

		expect(cell.getValue()).toBe('3:Store 1');
		expect(prepare).toHaveBeenCalledWith(3, row, cell);
	});

	it('assigns value and rowData to custom render components, then runs onComponentInitFunction', () => {
		class Renderer {}
		const onInit = vi.fn();
		const column = toSmartTableColumn({
			type: 'custom',
			renderComponent: Renderer,
			onComponentInitFunction: onInit,
		});
		const row = { id: 'w1', name: 'Store 1' };
		const cell = cellFor(row, 'name', column);
		const instance: any = {};

		column.componentInitFunction!(instance, cell);

		expect(instance.value).toBe('Store 1');
		expect(instance.rowData).toBe(row);
		expect(onInit).toHaveBeenCalledWith(instance);
	});

	it('gives custom render components the raw value, like ng2-smart-table (not the stringified one)', () => {
		// angular2-smart-table's cell.getValue() falls back to `v?.toString()`: an object reached the
		// customer page's order button as "[object Object]" and crashed WarehouseOrderComponent.
		class Renderer {}
		const column = toSmartTableColumn({
			type: 'custom',
			renderComponent: Renderer,
		});
		const actions = { actionName: 'Order', actionOwnerId: 'customer-1' };
		const row = { id: 'w1', actions, ordersQty: 0, isAvailable: false };
		const valueOf = (columnId: string) => {
			const instance: any = {};
			column.componentInitFunction!(
				instance,
				cellFor(row, columnId, column),
			);
			return instance.value;
		};

		expect(valueOf('actions')).toBe(actions);
		expect(valueOf('ordersQty')).toBe(0);
		expect(valueOf('isAvailable')).toBe(false);
	});

	it('gives custom render components the prepared value when the column has a valuePrepareFunction', () => {
		class Renderer {}
		const column = toSmartTableColumn({
			type: 'custom',
			renderComponent: Renderer,
			valuePrepareFunction: (qty, row) => ({ qty, productId: row.id }),
		});
		const instance: any = {};

		column.componentInitFunction!(
			instance,
			cellFor({ id: 'p1', qty: 2 }, 'qty', column),
		);

		expect(instance.value).toEqual({ qty: 2, productId: 'p1' });
	});

	it('leaves plain columns alone', () => {
		expect(toSmartTableColumn({ title: 'City', width: '10%' })).toEqual({
			title: 'City',
			width: '10%',
		});
	});
});

describe('toSmartTableSettings', () => {
	it('maps every column and keeps the table level settings', () => {
		const legacy = {
			mode: 'external' as const,
			selectMode: 'multi' as const,
			hideSubHeader: true,
			pager: { display: true, perPage: 5 },
			actions: { add: false, edit: false, delete: false },
			columns: {
				name: { title: 'Name', filter: false },
				city: { title: 'City', sort: false },
			},
		};

		const settings = toSmartTableSettings(legacy);

		expect(settings).toMatchObject({
			mode: 'external',
			selectMode: 'multi',
			hideSubHeader: true,
			pager: { display: true, perPage: 5 },
		});
		expect(settings.columns.name.isFilterable).toBe(false);
		expect(settings.columns.city.isSortable).toBe(false);
		// the input is not mutated
		expect(legacy.columns.name).toEqual({ title: 'Name', filter: false });
	});

	it('gives custom actions a button content from their title', () => {
		const settings = toSmartTableSettings({
			columns: {},
			actions: {
				custom: [{ name: 'view', title: '<i class="ion-md-eye"></i>' }],
			},
		});
		expect((settings.actions as any).custom[0].customButtonContent).toBe(
			'<i class="ion-md-eye"></i>',
		);
	});

	it('copes with missing settings', () => {
		expect(toSmartTableSettings({} as any).columns).toEqual({});
	});
});
