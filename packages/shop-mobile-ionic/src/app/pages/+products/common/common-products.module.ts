import { NgModule } from '@angular/core';
import { StoreSignComponent } from './store-sign/store-sign.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

const COMPONENTS = [StoreSignComponent];

@NgModule({
	imports: [CommonModule, TranslateModule.forChild()],
	declarations: COMPONENTS,
	exports: COMPONENTS,
})
export class CommonProducts {}
