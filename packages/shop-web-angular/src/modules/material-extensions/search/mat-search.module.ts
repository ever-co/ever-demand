import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSearchComponent } from './mat-search.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	imports: [
		CommonModule,
		MatButtonModule,
		MatRippleModule,
		TranslateModule.forChild(),
	],
	declarations: [MatSearchComponent],
	exports: [MatSearchComponent],
})
export class MatSearchModule {}
