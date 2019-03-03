import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {
	MatButtonModule,
	MatFormFieldModule,
	MatInputModule,
	MatIconModule,
	MatSelectModule,
	MatCheckboxModule
} from '@angular/material';
import {
	MatSearchModule,
	MatBoldInputModule
} from '@modules/material-extensions';
import { LocationFormComponent } from './location.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [LocationFormComponent],
	exports: [LocationFormComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

		MatFormFieldModule,
		MatButtonModule,
		MatInputModule,
		MatSelectModule,
		MatIconModule,
		MatCheckboxModule,

		MatSearchModule,
		MatBoldInputModule,
		TranslateModule.forChild()
	]
})
export class LocationFormModule {}
