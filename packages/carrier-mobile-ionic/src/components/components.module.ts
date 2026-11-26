import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading';
import { IonSpinner } from '@ionic/angular';

@NgModule({
	declarations: [LoadingComponent],
	imports: [IonSpinner],
	exports: [LoadingComponent],
})
export class ComponentsModule {}
