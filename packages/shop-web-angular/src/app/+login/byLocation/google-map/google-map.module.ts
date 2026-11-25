import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { GoogleMapComponent } from './google-map.component';

@NgModule({
	imports: [GoogleMapsModule],
	declarations: [GoogleMapComponent],
	exports: [GoogleMapComponent],
})
export class GoogleMapModule {}
