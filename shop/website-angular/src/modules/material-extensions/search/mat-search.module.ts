import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatRippleModule } from '@angular/material';
import { MatSearchComponent } from './mat-search.component';

@NgModule({
	imports: [CommonModule, MatButtonModule, MatRippleModule],
	declarations: [MatSearchComponent],
	exports: [MatSearchComponent]
})
export class MatSearchModule {}
