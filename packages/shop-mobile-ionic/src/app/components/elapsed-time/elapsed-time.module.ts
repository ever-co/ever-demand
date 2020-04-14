import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ElapsedTimeComponent } from './elapsed-time.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		TranslateModule.forChild(),
	],
	declarations: [ElapsedTimeComponent],
	entryComponents: [ElapsedTimeComponent],
	exports: [ElapsedTimeComponent],
})
export class ElapsedTimeModule {}
