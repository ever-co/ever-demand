import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { CarrierTableInfoComponent } from '../../../pages/+carriers/+carrier/carrier-info.component';
import { CarrierImageComponent } from './carrier-image/carrier-image.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CarrierPhoneComponent } from './carrier-phone/carrier-phone.component';
import { CarrierActionsComponent } from './carrier-actions/carrier-actions.component';
import { HighlightModule } from 'ngx-highlightjs';

const COMPONENTS = [
	CarrierActionsComponent,
	CarrierTableInfoComponent,
	CarrierImageComponent,
	CarrierPhoneComponent,
];

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        HighlightModule,
        TranslateModule.forChild(),
    ],
    declarations: COMPONENTS,
    exports: COMPONENTS
})
export class CarriersTableModule {}
