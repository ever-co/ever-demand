import { NgModule } from '@angular/core';
import { CustomerAddrPopupPage } from './customer-addr-popup';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [CustomerAddrPopupPage],
	entryComponents: [CustomerAddrPopupPage],
	imports: [TranslateModule.forChild(), CommonModule],
})
export class CustomerAddrPopupPageModule {}
