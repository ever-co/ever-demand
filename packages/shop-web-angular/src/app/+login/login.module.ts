import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBoldInputModule } from '../../modules/material-extensions';
import { MatSearchModule } from '../../modules/material-extensions/search';
import { routes } from './login.routes';
import { LoginComponent } from './login.component';
import { LoginByLocationModule } from './byLocation';
import {
	FaIconLibrary,
	FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { ByCodeModuleGuard } from './by-code.module.guard';
import { SocieModuleGuard } from './socie.module.guard';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { MessagePopUpModalModule } from 'app/shared/message-pop-up/message-pop-up.module';



@NgModule({
	declarations: [LoginComponent],
	imports: [
		CommonModule,
		FontAwesomeModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes),
		TranslateModule,
		MessagePopUpModalModule,

		MatFormFieldModule,
		MatButtonModule,
		MatInputModule,
		MatDialogModule,
		MatCardModule,

		MatSearchModule,
		MatBoldInputModule,

		LoginByLocationModule,
	],
	providers: [ByCodeModuleGuard, SocieModuleGuard],
})
export class LoginModule {
	public static routes = routes;

	constructor(library: FaIconLibrary) {
		library.addIcons(faFacebook, faGoogle);
	}
}
