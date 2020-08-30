import { SetupMerchantDeliveryAndTakeawayComponent } from './delivery-takeaway.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ThemeModule } from '@app/@theme';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CarriersSmartTableModule } from '@app/@shared/carrier/carriers-table/carriers-table.module';
import { SetupMerchantSharedCarriersComponent } from './shared-carriers/shared-carriers.component';
import { CarrierLocationModule } from '@app/pages/+carriers/+carrier/location/carrier-location.module';
import { TrackModule } from '@app/pages/+carriers/track/track.module';
import { RenderComponentsModule } from '@app/@shared/render-component/render-components.module';
import { CarrierMutationModule } from '@app/@shared/carrier/carrier-mutation';
import { SetupMerchantAddNewCarrierComponent } from './add-new-carrier/add-new-carrier.component';
import { CarrierFormsModule } from '@app/@shared/carrier/forms';
import { NbButtonModule } from '@nebular/theme';

const COMPONENTS = [
	SetupMerchantDeliveryAndTakeawayComponent,
	SetupMerchantSharedCarriersComponent,
	SetupMerchantAddNewCarrierComponent,
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormsModule,
		TranslateModule.forChild(),
		CarriersSmartTableModule,
		CarrierLocationModule,
		TrackModule,
		RenderComponentsModule,
		CarrierMutationModule,
		CarrierFormsModule,
		NbButtonModule,
	],
	declarations: COMPONENTS,
	exports: COMPONENTS,
})
export class SetupMerchantsDeliveryAndTakeawayModule {}
