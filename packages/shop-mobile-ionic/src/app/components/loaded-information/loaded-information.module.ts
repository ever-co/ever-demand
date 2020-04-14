import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoadedInformationComponent } from './loaded-information.component';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';

@NgModule({
	imports: [CommonModule, IonicModule, PipesModule],
	exports: [LoadedInformationComponent],
	declarations: [LoadedInformationComponent],
})
export class LoadedInformationModule {}
