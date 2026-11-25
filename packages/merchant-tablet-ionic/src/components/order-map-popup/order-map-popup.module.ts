import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderMapPopupPage } from './order-map-popup';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [OrderMapPopupPage],
    imports: [TranslateModule.forChild(), IonicModule, CommonModule],
    exports: [OrderMapPopupPage]
})
export class OrderMapPopupPageModule {}
