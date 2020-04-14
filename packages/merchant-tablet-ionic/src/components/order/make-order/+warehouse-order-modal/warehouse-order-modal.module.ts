import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { WarehouseOrderModalComponent } from './warehouse-order-modal.component';
import { WarehouseOrderInputComponent } from './warehouse-order-input.component';
import { TranslateModule } from '@ngx-translate/core';

const COMPONENTS = [WarehouseOrderModalComponent, WarehouseOrderInputComponent];

@NgModule({
	imports: [CommonModule, Ng2SmartTableModule, TranslateModule.forChild()],
	declarations: [WarehouseOrderModalComponent, WarehouseOrderInputComponent],
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class WarehouseOrderModalModule {}
