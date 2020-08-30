import { NgModule } from '@angular/core';
import { CarrierAddrPopupPage } from './carrier-addr-popup';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
	declarations: [CarrierAddrPopupPage],
	entryComponents: [CarrierAddrPopupPage],
	imports: [
		TranslateModule.forChild(),
		IonicModule,
		CommonModule,
		FormsModule,
	],
})
export class CarrierAddrPopupPageModule {}
