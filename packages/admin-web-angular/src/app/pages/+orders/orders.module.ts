import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../@theme';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightModule } from 'ngx-highlightjs';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './+order/order.component';
import { OrderModule } from './+order/order.module';

const routes: Routes = [
	{
		path: '',
		component: OrdersComponent,
	},
	{
		path: ':id',
		component: OrderComponent,
	},
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
		OrderModule,
	],
	declarations: [OrdersComponent],
	providers: [JsonPipe],
})
export class OrdersModule {
	public static routes = routes;
}
