import { NgModule } from '@angular/core';
import { LanguagePage } from './language';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItem } from '@ionic/angular/ion-item';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { IonRadio } from '@ionic/angular/ion-radio';
import { IonRadioGroup } from '@ionic/angular/ion-radio-group';
import { IonTitle } from '@ionic/angular/ion-title';
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
