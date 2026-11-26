import { NgModule } from '@angular/core';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ComponentsModule } from '../../../components/components.module';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/ion-content';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { TermsOfUsePage } from './terms-of-use';

const routes: Routes = [
	{
		path: '',
		component: TermsOfUsePage,
	},
];

@NgModule({
	declarations: [TermsOfUsePage],
	imports: [
		TranslateModule.forChild(),
		PipesModule,
		ComponentsModule,
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		IonContent,
		IonIcon,
		IonMenuToggle,
	],
})
export class TermsOfUsePageModule {}
