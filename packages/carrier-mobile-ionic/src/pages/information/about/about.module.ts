import { NgModule } from '@angular/core';
import { AboutPage } from './about';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from 'components/components.module';
import { IonicModule } from '@ionic/angular';
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
		IonicModule,
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
})
export class AboutPageModule {}
