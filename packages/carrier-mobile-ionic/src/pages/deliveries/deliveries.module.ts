import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { DeliveriesPage } from './deliveries';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderCardModule } from '../../components/order-card/order-card.module';
import {
	IonContent,
	IonHeader,
	IonIcon,
	IonMenuToggle,
	IonTitle,
} from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: DeliveriesPage,
	},
];

@NgModule({
	declarations: [DeliveriesPage],
	imports: [
		CommonModule,
		FormsModule,
		OrderCardModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		IonContent,
		IonHeader,
		IonIcon,
		IonMenuToggle,
		IonTitle,
	],
})
export class DeliveriesPageModule {}
