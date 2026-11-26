import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonMenuButton,
	IonRouterLink,
	IonSpinner,
	IonTitle,
	IonToolbar,
} from '@ionic/angular';
import { OrdersHistoryPage } from './orders-history.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderModule } from '../../components/order/order.module';
import { OrdersCardModule } from './order-card/order-card.module';

const routes: Routes = [
	{
		path: '',
		component: OrdersHistoryPage,
	},
	{
		path: ':id',
		loadChildren: () =>
			import('./+order-details/order-details.module').then(
				(m) => m.OrderDetailsPageModule
			),
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonButton,
		IonButtons,
		IonContent,
		IonHeader,
		IonMenuButton,
		IonRouterLink,
		IonSpinner,
		IonTitle,
		IonToolbar,
		OrderModule,
		OrdersCardModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
	declarations: [OrdersHistoryPage],
})
export class OrdersHistoryPageModule {}
