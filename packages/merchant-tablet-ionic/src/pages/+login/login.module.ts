import { NgModule } from '@angular/core';
import { LoginPage } from './login';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
	{
		path: '',
		component: LoginPage,
	},
];

@NgModule({
	declarations: [LoginPage],
	providers: [AuthService, Store],
	imports: [
		IonicModule,
		RouterModule.forChild(routes),
		CommonModule,
		FormsModule,
		TranslateModule.forChild(),
	],
})
export class LoginPageModule {}
