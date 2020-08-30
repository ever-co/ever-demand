import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '@app/@theme';
import { UserWarehouseLocationComponent } from './user-warehouse-map/user-warehouse-map';
import { CarrierLocationComponent } from './carreir-location/carreir-location';

const ORDER_MAP_COMPONENTS = [
	UserWarehouseLocationComponent,
	CarrierLocationComponent,
];
@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
	],

	declarations: [...ORDER_MAP_COMPONENTS],
	exports: [...ORDER_MAP_COMPONENTS],

	entryComponents: [],

	providers: [],
})
export class OrderMapModule {}
