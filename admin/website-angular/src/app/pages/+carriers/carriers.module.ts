import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { CarriersComponent } from './carriers.component';
import { ThemeModule } from '../../@theme';
import { FormWizardModule } from 'angular2-wizard';
import { CarrierMutationModule } from '../../@shared/carrier/carrier-mutation';
import { CarriersRoutingModule } from './carriers-routing.module';
import { RenderComponentsModule } from '../../@shared/render-component/render-components.module';
import { CarriersTableModule } from '../../@shared/render-component/carriers-table/carriers-table.module';
import { NbSpinnerModule } from '@nebular/theme';

@NgModule({
	imports: [
		CommonModule,
		Ng2SmartTableModule,
		ThemeModule,
		FormWizardModule,
		CarriersRoutingModule,
		CarrierMutationModule,
		ToasterModule.forChild(),
		TranslateModule.forChild(),
		RenderComponentsModule,
		CarriersTableModule,
		NbSpinnerModule
	],
	declarations: [CarriersComponent]
})
export class CarriersModule {}
