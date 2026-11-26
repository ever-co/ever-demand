import { NgModule } from '@angular/core';
import { AboutPage } from './about';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ComponentsModule } from '../../../components/components.module';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { IonTitle } from '@ionic/angular/ion-title';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: AboutPage,
	},
];

@NgModule({
	declarations: [AboutPage],
	imports: [
		PipesModule,
		ComponentsModule,
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		IonContent,
		IonHeader,
		IonIcon,
		IonMenuToggle,
		IonTitle,
	],
})
export class AboutPageModule {}
