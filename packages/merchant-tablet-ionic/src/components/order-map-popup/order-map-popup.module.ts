import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderMapPopupPage } from './order-map-popup';
import { IonIcon, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [OrderMapPopupPage],
    imports: [TranslateModule.forChild(), CommonModule, IonIcon],
    providers: [ModalController],
    exports: [OrderMapPopupPage]
})
export class OrderMapPopupPageModule {}
