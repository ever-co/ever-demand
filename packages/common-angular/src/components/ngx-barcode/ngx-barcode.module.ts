// adapted from https://github.com/yobryon/ngx-barcode (MIT © Bryon Williams)

import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxBarcodeComponent } from './ngx-barcode.component';

@NgModule({
	imports: [],
	declarations: [NgxBarcodeComponent],
	exports: [NgxBarcodeComponent],
})
export class NgxBarcodeModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: NgxBarcodeModule,
			providers: [],
		};
	}
}
