import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSearchComponent } from './mat-search.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

@NgModule({
	imports: [
		CommonModule,
		MatButtonModule,
		MatRippleModule,
		TranslateModule,
	],
	declarations: [MatSearchComponent],
	exports: [MatSearchComponent],
})
export class MatSearchModule {}
