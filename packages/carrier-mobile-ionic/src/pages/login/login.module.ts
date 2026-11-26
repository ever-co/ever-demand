import { NgModule } from '@angular/core';
import { LoginPage } from './login';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { Routes, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
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
		FormsModule,
		CommonModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		IonContent,
	],
	providers: [AuthService, Store],
})
export class LoginPageModule {}
