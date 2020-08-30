import { NgModule } from '@angular/core';
import { GoogleMapComponent } from './google-map.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'environments/environment';

@NgModule({
	imports: [
		AgmCoreModule.forRoot({
			apiKey: environment.GOOGLE_MAPS_API_KEY,
			libraries: ['drawing'],
		}),
	],
	declarations: [GoogleMapComponent],
	exports: [GoogleMapComponent],
})
export class GoogleMapModule {}
