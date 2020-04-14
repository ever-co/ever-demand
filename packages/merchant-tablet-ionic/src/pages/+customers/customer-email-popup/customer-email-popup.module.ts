import { NgModule } from '@angular/core';
import { CustomerEmailPopupPage } from './customer-email-popup';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
	declarations: [CustomerEmailPopupPage],
	entryComponents: [CustomerEmailPopupPage],
	imports: [
		TranslateModule.forChild(),
		IonicModule,
		CommonModule,
		FormsModule,
	],
})
export class CustomerEmailPopupPageModule {}
