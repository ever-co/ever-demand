import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../../@theme/theme.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { CarrierLocationComponent } from './carrier-location.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        TranslateModule.forChild(),
        NgxEchartsModule,
    ],
    declarations: [CarrierLocationComponent],
    exports: [CarrierLocationComponent]
})
export class CarrierLocationModule {}
