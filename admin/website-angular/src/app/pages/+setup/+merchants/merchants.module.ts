import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from 'app/@theme';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SetupMerchantsComponent } from './merchants.component';
import { NbStepperModule } from '@nebular/theme';
import { SetupMerchantsComponentsModule } from './components/components.module';
import { SetupMerchantsLocationModule } from './components/location/location.module';

const routes: Routes = [
	{
		path: '',
		component: SetupMerchantsComponent
	}
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		NbStepperModule,
		SetupMerchantsComponentsModule,
		SetupMerchantsLocationModule
	],
	declarations: [SetupMerchantsComponent]
})
export class SetupMerchantsModule {}
