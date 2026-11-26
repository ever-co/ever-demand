import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/angular';
import { ByCodePage } from './by-code.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
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
		IonButton,
		IonCol,
		IonGrid,
		IonIcon,
		IonRow,
		LoadingModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
	declarations: [ByCodePage],
	providers: [GeoLocationService, OrdersService],
})
export class ByCodePageModule {}
