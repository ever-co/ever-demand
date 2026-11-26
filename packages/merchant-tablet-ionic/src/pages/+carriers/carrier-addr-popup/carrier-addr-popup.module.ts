import { NgModule } from '@angular/core';
import { CarrierAddrPopupPage } from './carrier-addr-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ModalController } from '@ionic/angular/modal-controller';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [CarrierAddrPopupPage],
    imports: [
        TranslateModule.forChild(),
        CommonModule,
        FormsModule,
    ],
    providers: [ModalController]
})
export class CarrierAddrPopupPageModule {}
