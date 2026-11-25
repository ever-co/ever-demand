import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewTypeComponent } from './view-type.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import {
	faCompress,
	faExpand,
	faTableCellsLarge,
} from '@fortawesome/free-solid-svg-icons';
import {
	FaIconLibrary,
	FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		MatButtonToggleModule,
		MatIconModule,
		FontAwesomeModule,
		MatTooltipModule,
	],
	exports: [ViewTypeComponent],
	declarations: [ViewTypeComponent],
})
export class ViewTypeModule {
	constructor(library: FaIconLibrary) {
		library.addIcons(faTableCellsLarge, faCompress, faExpand);
	}
}
