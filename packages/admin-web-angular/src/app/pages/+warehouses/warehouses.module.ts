import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormWizardModule } from 'angular2-wizard';
import { ToasterModule } from 'angular2-toaster';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../@theme';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { WarehousesComponent } from './warehouses.component';
import { WarehousesRoutingModule } from './warehouses-routing.module';
import { WarehouseMutationModule } from '../../@shared/warehouse/warehouse-mutation';
import { HighlightModule } from 'ngx-highlightjs';
import { RenderComponentsModule } from '../../@shared/render-component/render-components.module';
import { WarehouseTableModule } from '../../@shared/render-component/warehouse-table/warehouse-table.module';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { ConfirmationModalModule } from '@app/@shared/confirmation-modal/confirmation-modal.module';
import { WarehouseTrackModule } from './+warehouse-track/warehouse-track.module';

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
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		HighlightModule.forRoot({ theme: 'github' }),
		RenderComponentsModule,
		WarehouseTableModule,
		NbSpinnerModule,
		NbButtonModule,
	],
	declarations: [WarehousesComponent],
	entryComponents: [],
	providers: [JsonPipe],
})
export class WarehousesModule {}

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
