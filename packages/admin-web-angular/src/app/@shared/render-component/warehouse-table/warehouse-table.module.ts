import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { ElapsedComponent } from './elapsed/elapsed.component';
import { WarehouseActionsComponent } from './warehouse-actions/warehouse-actions.component';
import { HighlightModule } from 'ngx-highlightjs';
import { TranslateModule } from '@ngx-translate/core';
import { WarehouseTableInfoComponent } from '../../../pages/+warehouses/+warehouse/warehouse-info/warehouse-info.component';
import { WarehouseImageComponent } from './warehouse-image/warehouse-image.component';
import { RouterModule } from '@angular/router';
import { WarehouseOrdersNumberComponent } from './warehouse-orders-number/warehouse-orders-number.component';
import { StatusComponent } from './status/status.component';
import { WarehouseEmailComponent } from './warehouse-email/warehouse-email.component';
import { WarehousePhoneComponent } from './warehouse-phone/warehouse-phone.component';

const COMPONENTS = [
	ElapsedComponent,
	WarehouseActionsComponent,
	WarehouseTableInfoComponent,
	WarehouseImageComponent,
	WarehouseOrdersNumberComponent,
	WarehouseEmailComponent,
	WarehousePhoneComponent,
	StatusComponent,
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		RouterModule,
		HighlightModule.forRoot({ theme: 'github' }),
		TranslateModule.forChild(),
	],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class WarehouseTableModule {}
