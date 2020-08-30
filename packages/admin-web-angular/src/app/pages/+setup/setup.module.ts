import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { SetupComponent } from './setup.component';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme';
import { TranslateModule } from '@ngx-translate/core';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';

const routes: Routes = [
	{
		path: '',
		component: SetupComponent,
	},
	{
		path: 'merchants',
		loadChildren: () =>
			import('./+merchants/merchants.module').then(
				(m) => m.SetupMerchantsModule
			),
	},
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		NbSpinnerModule,
		NbButtonModule,
	],
	declarations: [SetupComponent],
})
export class SetupModule {}
