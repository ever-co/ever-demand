import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BanConfirmComponent } from './ban-confirm.component';

@NgModule({
	declarations: [BanConfirmComponent],
	exports: [BanConfirmComponent],
	entryComponents: [BanConfirmComponent],
	imports: [CommonModule],
})
export class BanConfirmModule {}
