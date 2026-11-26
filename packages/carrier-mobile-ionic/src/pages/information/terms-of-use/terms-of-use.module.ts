import { NgModule } from '@angular/core';
import { TermsOfUsePage } from './terms-of-use';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
	IonContent,
	IonHeader,
	IonIcon,
	IonMenuToggle,
	IonTitle,
} from '@ionic/angular';

const routes: Routes = [
	{
		path: '',
		component: TermsOfUsePage,
	},
];

@NgModule({
	declarations: [TermsOfUsePage],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		PipesModule,
		IonContent,
		IonHeader,
		IonIcon,
		IonMenuToggle,
		IonTitle,
	],
})
export class TermsOfUsePageModule {}
