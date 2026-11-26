import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { OrderInfoPage } from './order-info.page';
import { CancelPageModule } from '../+cancel/cancel.module';
import { UserWarehouseLocationComponent } from './user-warehouse-map/user-warehouse-map';
import { IssuePageModule } from '../issue/issue.module';
import { ElapsedTimeModule } from '../../../../components/elapsed-time/elapsed-time.module';
import { StripeLoader } from 'app/services/stripeLoader';
import { OrderInfoCommonModule } from '../common/order-info-common.module';

const routes: Routes = [
	{
		path: '',
		component: OrderInfoPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		CancelPageModule,
		IssuePageModule,
		ElapsedTimeModule,
		OrderInfoCommonModule,
	],
	declarations: [OrderInfoPage, UserWarehouseLocationComponent],
})
export class OrderInfoPageModule {
	// Injected so the card form script starts loading with this module,
	// before the customer gets to Pay now. StripeLoader is one instance for
	// the app, so the page gets one script tag.
	constructor(_stripeLoader: StripeLoader) {}
}
