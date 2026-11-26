import { NgModule } from '@angular/core';
import { CustomerEmailPopupPage } from './customer-email-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [CustomerEmailPopupPage],
    imports: [
        TranslateModule.forChild(),
        CommonModule,
        FormsModule,
    ],
    providers: [ModalController]
})
export class CustomerEmailPopupPageModule {}
