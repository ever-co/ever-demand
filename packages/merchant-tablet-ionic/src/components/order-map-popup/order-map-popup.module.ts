import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OrderMapPopupPage } from './order-map-popup';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [OrderMapPopupPage],
	imports: [TranslateModule.forChild(), IonicModule, CommonModule],
	exports: [OrderMapPopupPage],
	entryComponents: [OrderMapPopupPage],
})
export class OrderMapPopupPageModule {}
