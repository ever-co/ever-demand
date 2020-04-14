import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { RedirectStoreComponent } from './redirect-store/redirect-store.component';
import { RedirectCarrierComponent } from './redirect-carrier/redirect-carrier.component';
import { RedirectOrderComponent } from './redirect-order.component';
import { RedirectProductComponent } from './redirect-product/redirect-product.component';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerOrderActionsComponent } from './customer-order-actions/customer-order-actions.component';
import { NbButtonModule } from '@nebular/theme';

const COMPONENTS = [
	RedirectStoreComponent,
	RedirectCarrierComponent,
	RedirectOrderComponent,
	RedirectProductComponent,
	CustomerOrderActionsComponent,
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		TranslateModule.forChild(),
		NbButtonModule,
	],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class CustomerOrdersTableModule {}
