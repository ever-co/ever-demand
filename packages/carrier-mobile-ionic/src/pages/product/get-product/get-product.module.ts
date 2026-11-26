import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { GetProductPage } from './get-product';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonCol } from '@ionic/angular/ion-col';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { IonRow } from '@ionic/angular/ion-row';
import { IonText } from '@ionic/angular/ion-text';
import { IonTitle } from '@ionic/angular/ion-title';
import { MenuModule } from '../../../components/menu/menu.module';

const routes: Routes = [
	{
		path: '',
		component: GetProductPage,
	},
];

@NgModule({
	// <swiper-container> / <swiper-slide> are Swiper custom elements (registered in main.ts).
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	declarations: [GetProductPage],
	imports: [
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		CommonModule,
		MenuModule,
		IonCol,
		IonContent,
		IonHeader,
		IonIcon,
		IonMenuToggle,
		IonRow,
		IonText,
		IonTitle,
	],
	providers: [],
})
export class GetProductPageModule {}
