import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewChild,
	ChangeDetectionStrategy,
} from '@angular/core';
import {
	Angular2SmartTableComponent,
	CreateCancelEvent,
	CreateConfirmEvent,
	CreateEvent,
	CustomActionEvent,
	DataSet,
	DeleteConfirmEvent,
	DeleteEvent,
	EditCancelEvent,
	EditConfirmEvent,
	EditEvent,
	Row,
	RowSelectionEvent,
	Settings,
} from 'angular2-smart-table';
import { LegacySettings, toSmartTableSettings } from './smart-table-settings';

/**
 * `<ng2-smart-table>` with the same inputs and outputs as ng2-smart-table 1.x, rendered by
 * angular2-smart-table (the maintained, Ivy-compiled fork). The legacy settings are mapped once
 * per settings change, see `toSmartTableSettings`.
 */
@Component({
	selector: 'ng2-smart-table',
	standalone: false,
	template: `
		<angular2-smart-table
			[settings]="tableSettings"
			[source]="source"
			(rowSelect)="rowSelect.emit($event)"
			(userRowSelect)="userRowSelect.emit($event)"
			(delete)="delete.emit($event)"
			(edit)="edit.emit($event)"
			(create)="create.emit($event)"
			(custom)="custom.emit($event)"
			(deleteConfirm)="deleteConfirm.emit($event)"
			(editConfirm)="editConfirm.emit($event)"
			(editCancel)="editCancel.emit($event)"
			(createConfirm)="createConfirm.emit($event)"
			(createCancel)="createCancel.emit($event)"
			(rowHover)="rowHover.emit($event)"
			(afterGridInit)="afterGridInit.emit($event)"
		></angular2-smart-table>
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
	styles: [':host { display: block; }'],
})
export class Ng2SmartTableComponent implements OnChanges {
	@Input() settings: LegacySettings = {};
	@Input() source: any;

	@Output() rowSelect = new EventEmitter<RowSelectionEvent>();
	@Output() userRowSelect = new EventEmitter<RowSelectionEvent>();
	@Output() delete = new EventEmitter<DeleteEvent>();
	@Output() edit = new EventEmitter<EditEvent>();
	@Output() create = new EventEmitter<CreateEvent>();
	@Output() custom = new EventEmitter<CustomActionEvent>();
	@Output() deleteConfirm = new EventEmitter<DeleteConfirmEvent>();
	@Output() editConfirm = new EventEmitter<EditConfirmEvent>();
	@Output() editCancel = new EventEmitter<EditCancelEvent>();
	@Output() createConfirm = new EventEmitter<CreateConfirmEvent>();
	@Output() createCancel = new EventEmitter<CreateCancelEvent>();
	@Output() rowHover = new EventEmitter<Row>();
	@Output() afterGridInit = new EventEmitter<DataSet>();

	@ViewChild(Angular2SmartTableComponent, { static: true })
	table: Angular2SmartTableComponent;

	tableSettings: Settings = { columns: {} };

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.settings) {
			this.tableSettings = toSmartTableSettings(this.settings ?? {});
		}
	}

	/** The fork's grid, for the few screens that reach into the table. */
	get grid() {
		return this.table?.grid;
	}
}
