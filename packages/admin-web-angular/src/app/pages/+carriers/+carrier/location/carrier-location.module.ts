import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../../@theme/theme.module';
import { AgmCoreModule } from '@agm/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgxEchartsModule } from 'ngx-echarts';
import { CarrierLocationComponent } from './carrier-location.component';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'environments/environment';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		AgmCoreModule.forRoot({
			apiKey: environment.GOOGLE_MAPS_API_KEY,
			libraries: ['places'],
		}),
		LeafletModule.forRoot(),
		TranslateModule.forChild(),
		NgxEchartsModule,
	],
	declarations: [CarrierLocationComponent],
	exports: [CarrierLocationComponent],
	entryComponents: [CarrierLocationComponent],
})
export class CarrierLocationModule {}
