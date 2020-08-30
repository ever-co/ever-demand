import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MessagePopUpComponent } from './message-pop-up.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';

const COMPONENTS = [MessagePopUpComponent];

@NgModule({
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatCardModule,
		TranslateModule.forChild(),
	],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class MessagePopUpModalModule {}
