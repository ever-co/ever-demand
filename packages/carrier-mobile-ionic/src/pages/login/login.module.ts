import { NgModule } from '@angular/core';
import { LoginPage } from './login';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const routes: Routes = [
	{
		path: '',
		component: LoginPage,
	},
];

@NgModule({
	declarations: [LoginPage],
	imports: [
		IonicModule,
		FormsModule,
		CommonModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
	],
	providers: [AuthService, Store],
})
export class LoginPageModule {}
