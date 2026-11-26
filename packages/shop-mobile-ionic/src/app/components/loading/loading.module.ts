import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSpinner } from '@ionic/angular';
import { LoadingComponent } from './loading.component';

@NgModule({
	imports: [CommonModule, IonSpinner],
	exports: [LoadingComponent],
	declarations: [LoadingComponent],
})
export class LoadingModule {}
