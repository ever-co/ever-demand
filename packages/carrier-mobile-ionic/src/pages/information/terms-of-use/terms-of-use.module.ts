import { NgModule } from '@angular/core';
import { TermsOfUsePage } from './terms-of-use';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
	{
		path: '',
		component: TermsOfUsePage,
	},
];

@NgModule({
	declarations: [TermsOfUsePage],
	imports: [
		IonicModule,
		CommonModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		PipesModule,
	],
})
export class TermsOfUsePageModule {}
