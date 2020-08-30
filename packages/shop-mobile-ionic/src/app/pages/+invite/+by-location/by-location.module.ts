import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ByLocationPage } from './by-location.page';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingModule } from '../../../components/loading/loading.module';

const routes: Routes = [
	{
		path: '',
		component: ByLocationPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),

		LoadingModule,
	],
	declarations: [ByLocationPage],
})
export class ByLocationPageModule {}
