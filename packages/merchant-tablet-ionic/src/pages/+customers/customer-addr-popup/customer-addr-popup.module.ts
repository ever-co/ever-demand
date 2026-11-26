import { NgModule } from '@angular/core';
import { CustomerAddrPopupPage } from './customer-addr-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [CustomerAddrPopupPage],
    imports: [TranslateModule.forChild(), CommonModule]
})
export class CustomerAddrPopupPageModule {}
