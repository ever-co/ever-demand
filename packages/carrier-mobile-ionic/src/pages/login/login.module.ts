import { NgModule } from '@angular/core';
import { LoginPage } from './login';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
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
