import { NgModule } from '@angular/core';
import { CarrierTrackPopup } from './carrier-track-popup';
import { TranslateModule } from '@ngx-translate/core';
import { CarrierService } from '../../../../src/services/carrier.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [CarrierTrackPopup],
	entryComponents: [CarrierTrackPopup],
	imports: [TranslateModule.forChild(), IonicModule, CommonModule],
	providers: [CarrierService]
})
export class CarrierTrackPopupModule {}
