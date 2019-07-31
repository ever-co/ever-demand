import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings';
import { SettingsPaymentsComponent } from './payments/payments';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaymentMutationComponent } from './payments/mutation/mutation';
import { ConfirmDeletePopupModule } from 'components/confirm-delete-popup/confirm-delete-popup.module';

@NgModule({
	declarations: [
		SettingsComponent,
		SettingsPaymentsComponent,
		PaymentMutationComponent
	],
	entryComponents: [PaymentMutationComponent],
	imports: [
		CommonModule,
		TranslateModule.forChild(),
		IonicModule,
		FormsModule,
		NgSelectModule,
		ConfirmDeletePopupModule
	],
	exports: [SettingsComponent]
})
export class MerchantSettingsComponentModule {}
