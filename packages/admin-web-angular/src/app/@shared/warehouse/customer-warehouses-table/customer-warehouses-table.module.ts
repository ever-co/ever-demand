import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../../@theme';
import { ToasterModule } from 'angular2-toaster';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CustomerWarehousesTableComponent } from './customer-warehouses-table.component';
import { WarehouseOrderComponent } from '../../../pages/+warehouses/+warehouse-order/warehouse-order.component';
import { SelectWarehouseComponent } from '../select-warehouse.component/select-warehouse.component';
import { WarehouseTableModule } from '../../render-component/warehouse-table/warehouse-table.module';
import { WarehouseInfoComponent } from '@app/pages/+warehouses/+warehouse-order/warehouse-info/warehouse-info.component';
import { HighlightModule } from 'ngx-highlightjs';

const COMPONENTS = [
	CustomerWarehousesTableComponent,
	WarehouseOrderComponent, // TODO REMOVE!
	SelectWarehouseComponent, // TODO REMOVE!
	WarehouseInfoComponent, // TODO REMOVE!
];

@NgModule({
	imports: [
		ThemeModule,
		ToasterModule,
		TranslateModule.forChild(),
		HighlightModule.forRoot({ theme: 'github' }),
		Ng2SmartTableModule,
		WarehouseTableModule,
	],
	declarations: COMPONENTS,
	exports: COMPONENTS,
	entryComponents: COMPONENTS,
})
export class CustomerWarehousesTableModule {}
