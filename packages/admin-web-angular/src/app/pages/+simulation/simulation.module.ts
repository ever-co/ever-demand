import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormWizardModule } from 'angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '../../@theme';
import { AdminStorageService } from '../../@core/data/fakeDataServices/storageService';
import { UserMutationModule } from '../../@shared/user/user-mutation';
import { WarehouseMutationModule } from '../../@shared/warehouse/warehouse-mutation';
import { SimulationComponent } from './simulation.component';
import { routes } from './simulation.routes';
import { SimulationTableModule } from '../../@shared/render-component/simulation-table/simulation-table.module';
import { GeoLocationService } from '../../@core/data/geo-location.service';
import { HighlightModule } from 'ngx-highlightjs';
import { SimulationProductsComponent } from './products/products.component';
import { CustomerOrdersModule } from '../+customers/+customer/ea-customer-orders/ea-customer-orders.module';
import { SimulationInstructionsComponent } from './instructions/instructions.component';
import { InviteRequestModalModule } from '@app/@shared/invite/invite-request/invite-request-modal.module';
import { ByCodeModalModule } from '@app/@shared/invite/by-code/by-code-modal.module';
import { SimulationOrderModule } from './order/order.module';
import { RenderComponentsModule } from '@app/@shared/render-component/render-components.module';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		HighlightModule.forRoot({ theme: 'github' }),
		UserMutationModule,
		InviteRequestModalModule,
		ByCodeModalModule,
		WarehouseMutationModule,
		SimulationTableModule,
		CustomerOrdersModule,
		SimulationOrderModule,
		RenderComponentsModule,
		NbSpinnerModule,
		NbButtonModule,
	],

	declarations: [
		SimulationComponent,
		SimulationProductsComponent,
		SimulationInstructionsComponent,
	],

	entryComponents: [],

	providers: [AdminStorageService, JsonPipe, GeoLocationService],
})
export class SimulationModule {
	public static routes = routes;
}
