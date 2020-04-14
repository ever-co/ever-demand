import { NgModule } from '@angular/core';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from 'components/components.module';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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
		IonicModule,
		RouterModule.forChild(routes),
	],
})
export class TermsOfUsePageModule {}
