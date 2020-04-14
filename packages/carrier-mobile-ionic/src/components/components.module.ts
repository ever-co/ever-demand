import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading';
import { IonicModule } from '@ionic/angular';

@NgModule({
	declarations: [LoadingComponent],
	imports: [IonicModule],
	exports: [LoadingComponent],
})
export class ComponentsModule {}
