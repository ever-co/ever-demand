import { NgModule } from '@angular/core';
import { LanguagePage } from './language';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Store } from '../../services/store.service';
import { Routes, RouterModule } from '@angular/router';
import {
	IonContent,
	IonIcon,
	IonItem,
	IonList,
	IonMenuToggle,
	IonSelect,
	IonSelectOption,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
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
		RouterModule.forChild(routes),
		CommonModule,
		FormsModule,
		TranslateModule.forChild(),
		IonContent,
		IonIcon,
		IonItem,
		IonList,
		IonMenuToggle,
		IonSelect,
		IonSelectOption,
	],
	providers: [Store],
})
export class LanguagePageModule {}
