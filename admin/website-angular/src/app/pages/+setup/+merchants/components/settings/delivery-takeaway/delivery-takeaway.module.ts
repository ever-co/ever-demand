import { SetupMerchantDeliveryAndTakeawayComponent } from './delivery-takeaway.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ThemeModule } from 'app/@theme';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CarriersSmartTableModule } from 'app/@shared/carrier/carriers-table/carriers-table.module';
import { RenderComponentsModule } from 'app/@shared/render-component/render-components.module';
import { SetupMerchantSharedCarriersComponent } from './shared-carriers/shared-carriers.component';

const COMPONENTS = [
	SetupMerchantDeliveryAndTakeawayComponent,
	SetupMerchantSharedCarriersComponent
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormsModule,
		TranslateModule.forChild(),
		CarriersSmartTableModule,
		RenderComponentsModule
	],
	declarations: COMPONENTS,
	exports: COMPONENTS
})
export class SetupMerchantsDeliveryAndTakeawayModule {}
