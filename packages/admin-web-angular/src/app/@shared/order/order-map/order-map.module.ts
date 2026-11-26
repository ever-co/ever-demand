import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterModule } from '@app/@core/toaster';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
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
    providers: []
})
export class OrderMapModule {}
