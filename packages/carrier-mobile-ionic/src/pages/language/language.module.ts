import { NgModule } from '@angular/core';
import { LanguagePage } from './language';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
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
		IonicModule,
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
})
export class LanguagePageModule {}
