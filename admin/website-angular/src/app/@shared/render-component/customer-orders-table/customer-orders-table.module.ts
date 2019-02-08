import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { RedirectStoreComponent } from './redirect-store.component';
import { RedirectCarrierComponent } from './redirect-carrier.component';
import { RedirectOrderComponent } from './redirect-order.component';
import { RedirectProductComponent } from './redirect-product.component';
import { CustomerOrderActionsComponent } from './customer-order-actions.component';
import { TranslateModule } from '@ngx-translate/core';

const COMPONENTS = [
	RedirectStoreComponent,
	RedirectCarrierComponent,
	RedirectOrderComponent,
	RedirectProductComponent,
	CustomerOrderActionsComponent
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		TranslateModule.forChild(),
	],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS
})
export class CustomerOrdersTableModule {
}
