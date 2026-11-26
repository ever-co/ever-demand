import { NgModule } from '@angular/core';
import { CarrierTrackPopup } from './carrier-track-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CarrierService } from '../../../../src/services/carrier.service';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';
import { WarehousesService } from '../../../../src/services/warehouses.service';

@NgModule({
    declarations: [CarrierTrackPopup],
    imports: [TranslateModule.forChild(), IonicModule, CommonModule],
    providers: [CarrierService, WarehousesService]
})
export class CarrierTrackPopupModule {}
