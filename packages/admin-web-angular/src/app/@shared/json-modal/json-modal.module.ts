import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme';
import { JsonModalComponent } from './json-modal.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { HighlightModule } from 'ngx-highlightjs';

const COMPONENTS = [JsonModalComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		TranslateModule.forChild(),
		HighlightModule,
	],
	declarations: COMPONENTS,
	exports: COMPONENTS
})
export class JsonModalModule {}
