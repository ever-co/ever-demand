import { CommonModule } from '@angular/common';
import { ThemeModule } from 'app/@theme';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SetupMerchantPaymentsComponent } from './payments.component';
import { NgModule } from '@angular/core';
import { PaymentGatewaysModule } from 'app/@shared/payment-gateways/payment-gateways.module';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormsModule,
		TranslateModule.forChild(),
		PaymentGatewaysModule
	],
	declarations: [SetupMerchantPaymentsComponent],
	exports: [SetupMerchantPaymentsComponent]
})
export class SetupMerchantsPaymentsModule {}
