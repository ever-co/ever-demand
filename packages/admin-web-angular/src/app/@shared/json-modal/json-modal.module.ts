import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme';
import { JsonModalComponent } from './json-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

const COMPONENTS = [JsonModalComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		TranslateModule.forChild(),
		HighlightModule,
	],
	declarations: COMPONENTS,
	exports: COMPONENTS,
	providers: [
		{
			provide: HIGHLIGHT_OPTIONS,
			useValue: {
				fullLibraryLoader: () => import('highlight.js'),
			}
		}
	],
})
export class JsonModalModule {}
