import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { CustomersComponent } from './customers.component';
import { ThemeModule } from '../../@theme';
import { HighlightModule } from 'ngx-highlightjs';
import { RenderComponentsModule } from '../../@shared/render-component/render-components.module';
import { GeoLocationService } from '../../@core/data/geo-location.service';
import { UserMutationModule } from '../../@shared/user/user-mutation';
import { CustomerTableModule } from '../../@shared/render-component/customer-table/customer-table.module';
import { NbSpinnerModule } from '@nebular/theme';
import { NotifyService } from 'app/@core/services/notify/notify.service';

const routes: Routes = [
	{
		path: 'list',
		component: CustomersComponent
	},
	{
		path: 'invites',
		loadChildren: './+invites/invites.module#InvitesModule'
	},
	{
		path: 'list/:id',
		loadChildren: './+customer/customer.module#CustomerModule'
	}
];

@NgModule({
	imports: [
		CommonModule,
		Ng2SmartTableModule,
		ThemeModule,
		ToasterModule.forRoot(),
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		HighlightModule.forRoot({ theme: 'github' }),
		RenderComponentsModule,
		UserMutationModule,
		CustomerTableModule,
		NbSpinnerModule
	],
	declarations: [CustomersComponent],
	providers: [JsonPipe, GeoLocationService, NotifyService]
})
export class CustomersModule {
	public static routes = routes;
}
