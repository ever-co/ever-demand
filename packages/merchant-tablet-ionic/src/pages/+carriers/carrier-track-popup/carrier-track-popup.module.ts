import { NgModule } from '@angular/core';
import { CarrierTrackPopup } from './carrier-track-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CarrierService } from '../../../../src/services/carrier.service';
import { ModalController } from '@ionic/angular/modal-controller';
import { CommonModule } from '@angular/common';
import { WarehousesService } from '../../../../src/services/warehouses.service';

@NgModule({
    declarations: [CarrierTrackPopup],
    imports: [TranslateModule.forChild(), CommonModule],
    providers: [CarrierService, WarehousesService, ModalController]
})
export class CarrierTrackPopupModule {}
