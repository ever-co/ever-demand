import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoadingComponent } from './loading.component';

@NgModule({
	imports: [CommonModule, IonicModule],
	exports: [LoadingComponent],
	declarations: [LoadingComponent],
})
export class LoadingModule {}
