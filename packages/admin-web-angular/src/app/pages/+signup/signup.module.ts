import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {
	NbAlertModule,
	NbButtonModule,
	NbInputModule,
	NbSpinnerModule,
} from '@nebular/theme';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ThemeModule } from '../../@theme';
import { SignupComponent } from './signup.component';

const routes: Routes = [{ path: '', component: SignupComponent }];

/** `#/auth/signup` (and the login page's "Register" link): a new tenant. */
@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		NbAlertModule,
		NbButtonModule,
		NbInputModule,
		NbSpinnerModule,
	],
	declarations: [SignupComponent],
})
export class SignupModule {}
