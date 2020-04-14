import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { CarriersComponent } from './carriers.component';
import { ThemeModule } from '../../@theme';
import { FormWizardModule } from 'angular2-wizard';
import { CarriersRoutingModule } from './carriers-routing.module';
import { RenderComponentsModule } from '../../@shared/render-component/render-components.module';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { TrackModule } from './track/track.module';
import { CarrierLocationModule } from './+carrier/location/carrier-location.module';
import { CarriersSmartTableModule } from '@app/@shared/carrier/carriers-table/carriers-table.module';
import { CarrierMutationModule } from '@app/@shared/carrier/carrier-mutation';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		CarriersRoutingModule,
		ToasterModule.forChild(),
		TranslateModule.forChild(),
		NbSpinnerModule,
		CarrierLocationModule,
		TrackModule,
		CarriersSmartTableModule,
		RenderComponentsModule,
		CarrierMutationModule,
		NbButtonModule,
	],
	declarations: [CarriersComponent],
})
export class CarriersModule {}
