import { NgModule } from '@angular/core';
import { LanguagePage } from './language';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import {
	IonContent,
	IonHeader,
	IonIcon,
	IonItem,
	IonMenuToggle,
	IonRadio,
	IonRadioGroup,
	IonTitle,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
	{
		path: '',
		component: LanguagePage,
	},
];

@NgModule({
	declarations: [LanguagePage],
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		IonContent,
		IonHeader,
		IonIcon,
		IonItem,
		IonMenuToggle,
		IonRadio,
		IonRadioGroup,
		IonTitle,
	],
})
export class LanguagePageModule {}
