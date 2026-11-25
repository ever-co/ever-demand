import type {
	Cell,
	IColumn,
	IColumns,
	Settings,
} from 'angular2-smart-table';

/**
 * The column settings the admin screens were written for (ng2-smart-table 1.x).
 *
 * ng2-smart-table is dead (View Engine only, no Ivy build), so the admin renders
 * angular2-smart-table, its maintained fork, through `<ng2-smart-table>` (see
 * `smart-table.component.ts`). The fork renamed or re-shaped a few settings; this file maps the
 * old shape onto the new one so the 20+ table settings in the screens can stay as they are.
 */
export interface LegacyColumn {
	title?: string;
	type?: 'text' | 'html' | 'custom';
	/** `false` hides the filter input of the column (fork: `isFilterable`). */
	filter?: boolean | { type: string; config?: any; component?: any };
	/** fork: `isSortable` */
	sort?: boolean;
	/** fork: `isEditable` */
	editable?: boolean;
	/** fork: `isAddable` */
	addable?: boolean;
	/** ng2-smart-table put this class on the column header (fork: `classHeader`). */
	class?: string;
	width?: string;
	renderComponent?: any;
	/** Called with the created render component (fork: `componentInitFunction`). */
	onComponentInitFunction?: (instance: any) => void;
	/** `(value, rowData)` in ng2-smart-table, `(value, cell)` in the fork. */
	valuePrepareFunction?: (value: any, rowData: any, cell?: Cell) => any;
	editor?: { type: string; config?: any; component?: any };
	[key: string]: any;
}

export type LegacySettings = Omit<Settings, 'columns'> & {
	columns?: { [key: string]: LegacyColumn };
	[key: string]: any;
};

/** ng2-smart-table assigned these two properties on custom render components. */
export interface ViewCell {
	value: string | number;
	rowData: any;
}

const RENAMED_FLAGS: ReadonlyArray<[keyof LegacyColumn, keyof IColumn]> = [
	['sort', 'isSortable'],
	['editable', 'isEditable'],
	['addable', 'isAddable'],
];

export function toSmartTableColumn(legacy: LegacyColumn): IColumn {
	const {
		filter,
		class: headerClass,
		onComponentInitFunction,
		valuePrepareFunction,
		...rest
	} = legacy;

	const column: Record<string, any> = { ...rest };

	for (const [from, to] of RENAMED_FLAGS) {
		if ((from as string) in column) {
			if (column[to as string] === undefined) {
				column[to as string] = column[from as string] !== false;
			}
			delete column[from as string];
		}
	}

	if (filter === false || filter === true) {
		column.isFilterable = filter;
	} else if (filter && typeof filter === 'object') {
		// `completer` filters were removed from the fork: fall back to the text filter.
		column.filter =
			filter.type === 'completer' ? { type: 'text' } : (filter as any);
	}

	if (headerClass && !column.classHeader) {
		column.classHeader = headerClass;
	}

	if (valuePrepareFunction) {
		column.valuePrepareFunction = (value: any, cell: Cell) =>
			valuePrepareFunction(value, cell.getRow().getData(), cell);
	}

	if (column.type === 'custom' && column.renderComponent) {
		const ownInit = column.componentInitFunction;
		column.componentInitFunction = (instance: any, cell: Cell) => {
			instance.value = cell.getValue();
			instance.rowData = cell.getRow().getData();
			ownInit?.(instance, cell);
			onComponentInitFunction?.(instance);
		};
	}

	return column as IColumn;
}

/** Maps legacy ng2-smart-table settings onto angular2-smart-table settings (new objects). */
export function toSmartTableSettings(legacy: LegacySettings): Settings {
	const settings: Settings & { [key: string]: any } = {
		...(legacy as any),
		columns: {},
	};

	const columns: IColumns = {};
	for (const [key, column] of Object.entries(legacy?.columns ?? {})) {
		columns[key] = toSmartTableColumn(column ?? {});
	}
	settings.columns = columns;

	if (settings.actions && Array.isArray(settings.actions.custom)) {
		settings.actions = {
			...settings.actions,
			custom: settings.actions.custom.map((action) => ({
				...action,
				customButtonContent:
					action.customButtonContent ?? action.title ?? action.name,
			})),
		};
	}

	return settings;
}
