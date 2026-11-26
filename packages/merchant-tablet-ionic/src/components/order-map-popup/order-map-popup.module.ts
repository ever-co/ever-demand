import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderMapPopupPage } from './order-map-popup';
import { IonIcon } from '@ionic/angular/ion-icon';
import { ModalController } from '@ionic/angular/modal-controller';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [OrderMapPopupPage],
    imports: [TranslateModule.forChild(), CommonModule, IonIcon],
    providers: [ModalController],
    exports: [OrderMapPopupPage]
})
export class OrderMapPopupPageModule {}
