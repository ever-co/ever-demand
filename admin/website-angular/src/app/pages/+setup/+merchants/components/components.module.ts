import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from 'app/@theme';
import { TranslateModule } from '@ngx-translate/core';
import { AccountComponent } from './account/account.component';
import { FormsModule } from '@angular/forms';

const COMPONENTS = [AccountComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormsModule,
		TranslateModule.forChild()
	],
	declarations: COMPONENTS,
	exports: COMPONENTS
})
export class SetupMerchantsComponentsModule {}
