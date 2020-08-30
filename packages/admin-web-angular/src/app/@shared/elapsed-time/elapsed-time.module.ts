import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ElapsedTimeComponent } from './elapsed-time.component';

@NgModule({
	imports: [CommonModule, FormsModule, TranslateModule.forChild()],
	declarations: [ElapsedTimeComponent],
	entryComponents: [ElapsedTimeComponent],
	exports: [ElapsedTimeComponent],
})
export class ElapsedTimeModule {}
