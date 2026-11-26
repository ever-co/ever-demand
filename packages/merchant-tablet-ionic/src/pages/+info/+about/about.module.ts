import { NgModule } from '@angular/core';
import { AboutPage } from './about';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ComponentsModule } from '../../../components/components.module';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonMenuToggle } from '@ionic/angular';

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
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		CommonModule,
		FormsModule,
		IonContent,
		IonIcon,
		IonMenuToggle,
	],
})
export class AboutPageModule {}
