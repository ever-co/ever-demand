import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { SimulationJsonComponent } from './sumulation-json.component';
import { JsonModalModule } from '../../json-modal/json-modal.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

const COMPONENTS = [SimulationJsonComponent];

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        JsonModalModule,
        TranslateModule.forChild(),
    ],
    declarations: COMPONENTS,
    exports: COMPONENTS
})
export class SimulationTableModule {}
