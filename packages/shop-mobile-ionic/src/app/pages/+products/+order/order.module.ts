import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { OrderPage } from './order.page';
import { TranslateModule } from '@ngx-translate/core';
import { OrderPopupComponent } from './order-popup.component';
import { ElapsedTimeModule } from '../../../components/elapsed-time/elapsed-time.module';
import { StripeLoader } from 'app/services/stripeLoader';
import { OrderInfoCommonModule } from './common/order-info-common.module';
import { MercadoLoader } from 'app/services/mercadoLoader';

const routes: Routes = [
	{
		path: '/test',
		component: OrderPopupComponent,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		ElapsedTimeModule,
		OrderInfoCommonModule,
	],
	entryComponents: [OrderPage],
	declarations: [OrderPage, OrderPopupComponent],
	providers: [
		StripeLoader,
		MercadoLoader,
		{
			provide: OrderPageModule,
			useFactory: paymentLoaderFactory,
			deps: [StripeLoader, MercadoLoader],
		},
	],
})
export class OrderPageModule {}

export function paymentLoaderFactory(provider: StripeLoader) {
	return () => provider;
}
