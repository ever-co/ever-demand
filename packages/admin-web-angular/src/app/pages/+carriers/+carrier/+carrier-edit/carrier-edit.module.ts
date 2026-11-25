import { NgModule } from '@angular/core';
import { CarrierEditComponent } from './carrier-edit.component';
import { ThemeModule } from '../../../../@theme/theme.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { LocationFormModule } from '../../../../@shared/forms/location';
import { CarrierFormsModule } from '../../../../@shared/carrier/forms';
import { GoogleMapModule } from '../../../../@shared/forms/google-map/google-map.module';
import { RouterModule } from '@angular/router';
import { routes } from './carrier-edit.routes';
import { ToasterModule } from '@app/@core/toaster';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';

@NgModule({
	imports: [
		ThemeModule,
		TranslateModule.forChild(),
		ToasterModule.forRoot(),
		RouterModule.forChild(routes),
		CarrierFormsModule,
		LocationFormModule,
		GoogleMapModule,
		NbSpinnerModule,
		NbButtonModule,
	],
	exports: [CarrierEditComponent],
	declarations: [CarrierEditComponent],
})
export class CarrierEditModule {}
