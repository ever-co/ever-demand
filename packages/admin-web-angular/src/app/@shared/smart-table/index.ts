import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { Ng2SmartTableComponent } from './smart-table.component';

/**
 * Drop-in replacement for ng2-smart-table's `Ng2SmartTableModule`: declares `<ng2-smart-table>`
 * on top of angular2-smart-table. Import everything table related from here.
 */
@NgModule({
	imports: [CommonModule, Angular2SmartTableModule],
	declarations: [Ng2SmartTableComponent],
	exports: [Ng2SmartTableComponent],
})
export class Ng2SmartTableModule {}

export { Ng2SmartTableComponent } from './smart-table.component';
export {
	toSmartTableColumn,
	toSmartTableSettings,
	type LegacyColumn,
	type LegacySettings,
	type ViewCell,
} from './smart-table-settings';
export {
	Cell,
	DefaultEditor,
	LocalDataSource,
	type Settings,
} from 'angular2-smart-table';
