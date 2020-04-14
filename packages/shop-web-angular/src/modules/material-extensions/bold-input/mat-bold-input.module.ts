import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatBoldInputComponent } from './mat-bold-input.component';

@NgModule({
	imports: [CommonModule, FormsModule, MatRippleModule],
	declarations: [MatBoldInputComponent],
	exports: [MatBoldInputComponent],
})
export class MatBoldInputModule {}
