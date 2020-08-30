import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TakeawayStoreInfoComponent } from './store-info/store-info.component';
import { TakeawayTitleComponent } from './title/title.component';
import { TakeawayOrderInfoComponent } from './order-info/order-info.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxBarcodeModule } from '@modules/client.common.angular2/components/ngx-barcode/ngx-barcode.module';

const COMPONENTS = [
	TakeawayStoreInfoComponent,
	TakeawayTitleComponent,
	TakeawayOrderInfoComponent,
];

@NgModule({
	imports: [CommonModule, TranslateModule.forChild(), NgxBarcodeModule],
	entryComponents: [],
	declarations: COMPONENTS,
	providers: [],
	exports: COMPONENTS,
})
export class TakeawayCommonModule {}
