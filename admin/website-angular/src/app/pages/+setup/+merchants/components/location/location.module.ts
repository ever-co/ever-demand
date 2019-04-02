import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from 'app/@theme';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { SetupMerchantLocationComponent } from './location.component';
import { LocationFormModule } from 'app/@shared/forms/location';

const COMPONENTS = [SetupMerchantLocationComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormsModule,
		TranslateModule.forChild(),
		LocationFormModule
	],
	declarations: COMPONENTS,
	exports: COMPONENTS
})
export class SetupMerchantsLocationModule {}
