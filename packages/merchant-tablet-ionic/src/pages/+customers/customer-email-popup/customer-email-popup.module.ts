import { NgModule } from '@angular/core';
import { CustomerEmailPopupPage } from './customer-email-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [CustomerEmailPopupPage],
    imports: [
        TranslateModule.forChild(),
        IonicModule,
        CommonModule,
        FormsModule,
    ]
})
export class CustomerEmailPopupPageModule {}
