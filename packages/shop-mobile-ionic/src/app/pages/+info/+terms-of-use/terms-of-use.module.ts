import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TermsOfUsePage } from './terms-of-use.page';
import { TranslateModule } from '@ngx-translate/core';
import { LoadedInformationModule } from '../../../components/loaded-information/loaded-information.module';

const routes: Routes = [
	{
		path: '',
		component: TermsOfUsePage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),

		LoadedInformationModule,
	],
	declarations: [TermsOfUsePage],
})
export class TermsOfUsePageModule {}
