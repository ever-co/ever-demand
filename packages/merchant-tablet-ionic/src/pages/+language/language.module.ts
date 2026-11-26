import { NgModule } from '@angular/core';
import { LanguagePage } from './language';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Store } from '../../services/store.service';
import { Routes, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/ion-content';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItem } from '@ionic/angular/ion-item';
import { IonList } from '@ionic/angular/ion-list';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
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
