import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { LocationPopupComponent } from './location-popup.component';
import { LocationFormModule } from 'app/+login/byLocation/location/location.module';
import { GoogleMapModule } from 'app/+login/byLocation/google-map/google-map.module';

const COMPONENTS = [LocationPopupComponent];

@NgModule({
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatCardModule,
		TranslateModule.forChild(),
		LocationFormModule,
		GoogleMapModule,
	],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class LocationPopupModalModule {}
