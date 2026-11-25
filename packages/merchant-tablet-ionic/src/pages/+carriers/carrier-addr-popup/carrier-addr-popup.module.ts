import { NgModule } from '@angular/core';
import { CarrierAddrPopupPage } from './carrier-addr-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [CarrierAddrPopupPage],
    imports: [
        TranslateModule.forChild(),
        IonicModule,
        CommonModule,
        FormsModule,
    ]
})
export class CarrierAddrPopupPageModule {}
