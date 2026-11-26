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
	declarations: [OrderPage, OrderPopupComponent],
})
export class OrderPageModule {
	// Injected so the card form script starts loading with this module,
	// before the customer gets to Pay now. StripeLoader is one instance for
	// the app, so the page gets one script tag.
	constructor(_stripeLoader: StripeLoader) {}
}
