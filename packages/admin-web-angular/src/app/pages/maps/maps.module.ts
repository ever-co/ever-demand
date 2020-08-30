import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgxEchartsModule } from 'ngx-echarts';
import { ThemeModule } from '../../@theme/theme.module';
import { MapsRoutingModule, routedComponents } from './maps-routing.module';
import { environment } from 'environments/environment';

@NgModule({
	imports: [
		ThemeModule,
		AgmCoreModule.forRoot({
			apiKey: environment.GOOGLE_MAPS_API_KEY,
			libraries: ['places'],
		}),
		LeafletModule.forRoot(),
		MapsRoutingModule,
		NgxEchartsModule,
	],
	exports: [],
	declarations: [...routedComponents],
})
export class MapsModule {}
