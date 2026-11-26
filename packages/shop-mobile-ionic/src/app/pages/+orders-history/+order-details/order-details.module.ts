import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
	IonButtons,
	IonContent,
	IonHeader,
	IonMenuButton,
	IonSpinner,
	IonTitle,
	IonToolbar,
} from '@ionic/angular';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderDetailsPage } from './order-details.page';
import { OrderModule } from '../../../components/order/order.module';

const routes: Routes = [
	{
		path: ':id',
		component: OrderDetailsPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		IonButtons,
		IonContent,
		IonHeader,
		IonMenuButton,
		IonSpinner,
		IonTitle,
		IonToolbar,
		OrderModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
	declarations: [OrderDetailsPage],
})
export class OrderDetailsPageModule {}
