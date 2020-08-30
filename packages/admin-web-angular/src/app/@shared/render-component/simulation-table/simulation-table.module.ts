import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { SimulationJsonComponent } from './sumulation-json.component';
import { JsonModalModule } from '../../json-modal/json-modal.module';
import { TranslateModule } from '@ngx-translate/core';

const COMPONENTS = [SimulationJsonComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		JsonModalModule,
		TranslateModule.forChild(),
	],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class SimulationTableModule {}
