import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../../../@theme';
import { UserFormsModule } from '../../../../@shared/user/forms';
import { LocationFormModule } from '../../../../@shared/forms/location';
import { GoogleMapModule } from '../../../../@shared/forms/google-map/google-map.module';
import { CustomerEditComponent } from './customer-edit.component';
import { ToasterModule } from '@app/@core/toaster';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';

const routes: Routes = [
	{
		path: '',
		component: CustomerEditComponent,
	},
];

@NgModule({
	imports: [
		ThemeModule,
		ToasterModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),

		UserFormsModule,
		LocationFormModule,
		GoogleMapModule,
		NbSpinnerModule,
		NbButtonModule,
	],
	declarations: [CustomerEditComponent],
})
export class CustomerEditModule {}
