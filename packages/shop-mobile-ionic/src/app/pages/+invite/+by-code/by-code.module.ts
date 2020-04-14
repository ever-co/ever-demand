import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ByCodePage } from './by-code.page';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingModule } from '../../../components/loading/loading.module';
import { GeoLocationService } from 'app/services/geo-location';
import { OrdersService } from 'app/services/orders/orders.service';

const routes: Routes = [
	{
		path: '',
		component: ByCodePage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		LoadingModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
	declarations: [ByCodePage],
	providers: [GeoLocationService, OrdersService],
})
export class ByCodePageModule {}
