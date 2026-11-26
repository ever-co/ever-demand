import { NgModule } from '@angular/core';
import { LoginPage } from './login';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';

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
		RouterModule.forChild(routes),
		CommonModule,
		FormsModule,
		TranslateModule.forChild(),
		IonContent,
	],
})
export class LoginPageModule {}
