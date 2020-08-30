import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HelpPage } from './help.page';
import { TranslateModule } from '@ngx-translate/core';
import { LoadedInformationModule } from 'app/components/loaded-information/loaded-information.module';

const routes: Routes = [
	{
		path: '',
		component: HelpPage,
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
	declarations: [HelpPage],
})
export class HelpPageModule {}
