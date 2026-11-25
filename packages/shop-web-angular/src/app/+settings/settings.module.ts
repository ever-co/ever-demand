import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { routes } from './settings.routes';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { WarehouseLogoModule } from '../warehouse-logo';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { SettingsComponent } from 'app/+settings/settings.component';


@NgModule({
	declarations: [SettingsComponent],
	imports: [
		CommonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		TranslateModule,
		FormsModule,
		RouterModule.forChild(routes),
		WarehouseLogoModule,
		MatIconModule,
		MatButtonModule,
		MatSidenavModule,
		MatToolbarModule,
		MatCheckboxModule,
		MatListModule,
		MatCardModule,
	],
})
export class SettingsModule {
	public static routes = routes;
}
