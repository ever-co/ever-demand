import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewTypeComponent } from './view-type.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
	constructor() {
		library.add(fas, far);
	}
}
