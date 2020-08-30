import { Routes, RouterModule } from '@angular/router';
import { OrderTakeawayInfoPage } from './takeaway-page.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CancelPageModule } from '../../+cancel/cancel.module';
import { IssuePageModule } from '../../issue/issue.module';
import { FormsModule } from '@angular/forms';
import { OrderInfoCommonModule } from '../../common/order-info-common.module';
import { OrderStoreInfoModule } from './store-info/store-info.module';
import { OrderProductsInfoModule } from './products-info/products-info.module';

const routes: Routes = [
	{
		path: '',
		component: OrderTakeawayInfoPage,
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
		OrderInfoCommonModule,
		OrderStoreInfoModule,
		OrderProductsInfoModule,
	],
	entryComponents: [],
	declarations: [OrderTakeawayInfoPage],
	providers: [],
})
export class OrderTakeawayInfoPageModule {}
