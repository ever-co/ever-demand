import { CommonModule } from '@angular/common';
import { ThemeModule } from '@app/@theme';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SetupMerchantPaymentsComponent } from './payments.component';
import { NgModule } from '@angular/core';
import { PaymentGatewaysModule } from '@app/@shared/payment-gateways/payment-gateways.module';
import { NbButtonModule } from '@nebular/theme';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormsModule,
		TranslateModule.forChild(),
		PaymentGatewaysModule,
		NbButtonModule,
	],
	declarations: [SetupMerchantPaymentsComponent],
	exports: [SetupMerchantPaymentsComponent],
})
export class SetupMerchantsPaymentsModule {}
