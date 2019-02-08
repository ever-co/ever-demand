import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { CarrierActionsComponent } from './carrier-actions.component';
import { CarrierTableInfoComponent } from '../../../pages/+carriers/+carrier/carrier-info.component';
import { CarrierImageComponent } from './carrier-image/carrier-image.component';
import { TranslateModule } from '@ngx-translate/core';
import { CarrierPhoneComponent } from './carrier-phone/carrier-phone.component';

const COMPONENTS = [
	CarrierActionsComponent,
	CarrierTableInfoComponent,
	CarrierImageComponent,
	CarrierPhoneComponent
];

@NgModule({
	imports: [CommonModule, ThemeModule, TranslateModule.forChild()],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS
})
export class CarriersTableModule {}
