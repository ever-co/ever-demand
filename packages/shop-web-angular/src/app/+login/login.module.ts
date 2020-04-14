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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { ByCodeModuleGuard } from './by-code.module.guard';
import { SocieModuleGuard } from './socie.module.guard';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MessagePopUpModalModule } from 'app/shared/message-pop-up/message-pop-up.module';

library.add(far);
library.add(faFacebook);
library.add(faGoogle);

console.log('`Login` bundle loaded asynchronously');

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	declarations: [LoginComponent],
	imports: [
		CommonModule,
		FontAwesomeModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
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
}
