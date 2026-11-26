import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading';
import { IonSpinner } from '@ionic/angular/ion-spinner';

@NgModule({
	declarations: [LoadingComponent],
	imports: [IonSpinner],
	exports: [LoadingComponent],
})
export class ComponentsModule {}
