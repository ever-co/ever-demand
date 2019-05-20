import { NgModule } from '@angular/core';
import { ThemeModule } from 'app/@theme';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentGatewaysComponent } from './payment-gateways.component';
import { StripeGatewayComponent } from './stripe-gateway/stripe-gateway.component';
import { PayPalGatewayComponent } from './payPal-gateway/payPal-gateway.component';

@NgModule({
	imports: [CommonModule, ThemeModule, TranslateModule.forChild()],
	declarations: [
		PaymentGatewaysComponent,
		StripeGatewayComponent,
		PayPalGatewayComponent
	],
	exports: [PaymentGatewaysComponent]
})
export class PaymentGatewaysModule {}
