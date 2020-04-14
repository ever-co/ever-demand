import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBoldInputModule } from '../../../modules/material-extensions';
import { MatSearchModule } from '../../../modules/material-extensions/search';
import { LoginByLocationComponent } from './byLocation.component';
import { GoogleMapModule } from './google-map/google-map.module';
import { LocationFormModule } from './location/location.module';
import { GeoLocationService } from 'app/services/geo-location';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [LoginByLocationComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

		MatFormFieldModule,
		MatButtonModule,
		MatInputModule,

		MatSearchModule,
		MatBoldInputModule,

		GoogleMapModule,
		LocationFormModule,
		TranslateModule.forChild(),
	],
	providers: [GeoLocationService],
})
export class LoginByLocationModule {}
