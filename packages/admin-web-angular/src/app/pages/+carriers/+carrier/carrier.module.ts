import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarrierComponent } from './carrier.component';
import { ThemeModule } from '../../../@theme';
import { RouterModule } from '@angular/router';
import { routes } from './carrier.routes';
import { CarrierLocationModule } from './location/carrier-location.module';
import { CarrierInfoComponent } from './carrier-info/carrier-info.component';
import { CarrierOrdersStatusComponent } from './carrier-orders-status/carrier-orders-status.component';
import { CarrierOrdersComponent } from './carrier-orders/carrier-orders.component';
import { FormWizardModule } from 'angular2-wizard';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { CarrierMutationModule } from '../../../@shared/carrier/carrier-mutation';
import { HighlightModule } from 'ngx-highlightjs';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { CarriersTableModule } from '../../../@shared/render-component/carriers-table/carriers-table.module';
import { CarrierOrdersHistoryComponent } from './carrier-orders-history/carrier-orders-history.component';
import { RenderComponentsModule } from '../../../@shared/render-component/render-components.module';
import { CarriersService } from '../../../@core/data/carriers.service';
import { GeoLocationOrdersService } from '../../../@core/data/geo-location-orders.service';
import { CarriersOrdersService } from '../../../@core/data/carriers-orders.service';
import { CarrierOrdersTableModule } from '../../../@shared/render-component/carrier-orders-table/carrier-orders-table.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		CarrierLocationModule,
		CarrierMutationModule,
		CarriersTableModule,
		RenderComponentsModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		HighlightModule.forRoot({ theme: 'github' }),
		NbSpinnerModule,
		CarrierOrdersTableModule,
		NgSelectModule,
		FormsModule,
		NbButtonModule,
	],
	declarations: [
		CarrierComponent,
		CarrierInfoComponent,
		CarrierOrdersStatusComponent,
		CarrierOrdersComponent,
		CarrierOrdersHistoryComponent,
	],
	entryComponents: [],
	providers: [
		CarriersService,
		GeoLocationOrdersService,
		CarriersOrdersService,
	],
})
export class CarrierModule {}
