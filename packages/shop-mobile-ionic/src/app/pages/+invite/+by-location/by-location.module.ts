import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
	IonButton,
	IonCheckbox,
	IonCol,
	IonGrid,
	IonRow,
	IonSpinner,
	IonTextarea,
} from '@ionic/angular';
import { ByLocationPage } from './by-location.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { LoadingModule } from '../../../components/loading/loading.module';

const routes: Routes = [
	{
		path: '',
		component: ByLocationPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonButton,
		IonCheckbox,
		IonCol,
		IonGrid,
		IonRow,
		IonSpinner,
		IonTextarea,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),

		LoadingModule,
	],
	declarations: [ByLocationPage],
})
export class ByLocationPageModule {}
