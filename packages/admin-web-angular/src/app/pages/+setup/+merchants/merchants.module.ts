import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '@app/@theme';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SetupMerchantsComponent } from './merchants.component';
import { NbStepperModule } from '@nebular/theme';
import { SetupMerchantsComponentsModule } from './components/components.module';
import { SetupMerchantsLocationModule } from './components/location/location.module';
import { SetupMerchantsDeliveryAndTakeawayModule } from './components/settings/delivery-takeaway/delivery-takeaway.module';
import { ToasterModule } from 'angular2-toaster';
import { SetupMerchantsProductsModule } from './components/products/products.module';
import { SetupMerchantsPaymentsModule } from './components/payments/payments.module';

const routes: Routes = [
	{
		path: '',
		component: SetupMerchantsComponent,
	},
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		NbStepperModule,
		SetupMerchantsComponentsModule,
		SetupMerchantsLocationModule,
		SetupMerchantsDeliveryAndTakeawayModule,
		SetupMerchantsProductsModule,
		SetupMerchantsPaymentsModule,
		ToasterModule.forRoot(),
	],
	declarations: [SetupMerchantsComponent],
})
export class SetupMerchantsModule {}
