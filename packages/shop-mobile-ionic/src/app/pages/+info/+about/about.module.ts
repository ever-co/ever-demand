import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
	IonButtons,
	IonContent,
	IonHeader,
	IonMenuButton,
	IonTitle,
	IonToolbar,
} from '@ionic/angular';
import { AboutPage } from './about.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { LoadedInformationModule } from '../../../components/loaded-information/loaded-information.module';

const routes: Routes = [
	{
		path: '',
		component: AboutPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonButtons,
		IonContent,
		IonHeader,
		IonMenuButton,
		IonTitle,
		IonToolbar,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),

		LoadedInformationModule,
	],
	declarations: [AboutPage],
})
export class AboutPageModule {}
