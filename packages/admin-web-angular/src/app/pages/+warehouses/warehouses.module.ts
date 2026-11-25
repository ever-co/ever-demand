import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormWizardModule } from '@app/@shared/wizard';
import { ToasterModule } from '@app/@core/toaster';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { ThemeModule } from '../../@theme';
import { WarehousesComponent } from './warehouses.component';
import { WarehousesRoutingModule } from './warehouses-routing.module';
import { WarehouseMutationModule } from '../../@shared/warehouse/warehouse-mutation';
import { HighlightModule } from 'ngx-highlightjs';
import { RenderComponentsModule } from '../../@shared/render-component/render-components.module';
import { WarehouseTableModule } from '../../@shared/render-component/warehouse-table/warehouse-table.module';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { ConfirmationModalModule } from '@app/@shared/confirmation-modal/confirmation-modal.module';
import { WarehouseTrackModule } from './+warehouse-track/warehouse-track.module';
import { TranslateModule } from '@app/@shared/translate/translate.module';

@NgModule({
	imports: [
		ThemeModule,
		CommonModule,
		WarehouseMutationModule,
		WarehousesRoutingModule,
		Ng2SmartTableModule,
		FormWizardModule,
		ConfirmationModalModule,
		WarehouseTrackModule,
		ToasterModule.forRoot(),
		TranslateModule,
		HighlightModule,
		RenderComponentsModule,
		WarehouseTableModule,
		NbSpinnerModule,
		NbButtonModule,
	],
	declarations: [WarehousesComponent],
	providers: [JsonPipe],
})
export class WarehousesModule {}
