import { NgModule } from '@angular/core';
import { AboutPage } from './about';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ComponentsModule } from '../../../components/components.module';
import {
	IonContent,
	IonHeader,
	IonIcon,
	IonMenuToggle,
	IonTitle,
} from '@ionic/angular';
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
