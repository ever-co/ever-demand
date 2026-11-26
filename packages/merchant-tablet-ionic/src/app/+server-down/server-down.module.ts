import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/ion-content';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { ServerDownPage } from './server-down.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';


const routes: Routes = [
	{
		path: '',
		component: ServerDownPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		PipesModule,
		TranslateModule.forChild(),
		IonContent,
	],
	declarations: [ServerDownPage],
})
export class ServerDownPageModule {}
