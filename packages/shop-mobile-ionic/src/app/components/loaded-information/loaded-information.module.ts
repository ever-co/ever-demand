import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSpinner } from '@ionic/angular';
import { LoadedInformationComponent } from './loaded-information.component';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';

@NgModule({
	imports: [CommonModule, IonSpinner, PipesModule],
	exports: [LoadedInformationComponent],
	declarations: [LoadedInformationComponent],
})
export class LoadedInformationModule {}
