import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { DeliveriesPage } from './deliveries';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderCardModule } from '../../components/order-card/order-card.module';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { IonTitle } from '@ionic/angular/ion-title';
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
