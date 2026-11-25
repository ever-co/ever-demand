import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { WarehouseOrderModalComponent } from './warehouse-order-modal.component';
import { WarehouseOrderInputComponent } from './warehouse-order-input.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

const COMPONENTS = [WarehouseOrderModalComponent, WarehouseOrderInputComponent];

@NgModule({
	imports: [CommonModule, Angular2SmartTableModule, TranslateModule.forChild()],
	declarations: [WarehouseOrderModalComponent, WarehouseOrderInputComponent],
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class WarehouseOrderModalModule {}
