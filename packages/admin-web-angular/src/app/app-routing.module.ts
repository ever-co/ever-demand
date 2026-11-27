import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import {
	NbAuthComponent,
	NbLoginComponent,
	NbLogoutComponent,
	NbRequestPasswordComponent,
	NbResetPasswordComponent,
} from '@nebular/auth';
import { AdminAuthGuard } from './@core/auth/admin-auth.guard';
import { AppModuleGuard } from './app.module.guard';
import { MaintenanceModuleGuard } from './pages/+maintenance-info/maintenance-info.module.guard';

const routes: Routes = [
	{
		path: '',
		loadChildren: () =>
			import('app/pages/pages.module').then((m) => m.PagesModule),
		canActivate: [AppModuleGuard, AdminAuthGuard],
	},
	{
		path: 'auth',
		component: NbAuthComponent,
		canActivate: [AppModuleGuard],
		children: [
			{
				path: '',
				component: NbLoginComponent,
			},
			{
				path: 'login',
				component: NbLoginComponent,
			},
			{
				// a new business (tenant) and its owner, DESIGN.md §6
				path: 'signup',
				loadChildren: () =>
					import('app/pages/+signup/signup.module').then(
						(m) => m.SignupModule
					),
			},
			{
				// the login page's "Register" link: admins of an existing business are
				// added by its owner (Settings → Members), so registering means a signup
				path: 'register',
				redirectTo: 'signup',
				pathMatch: 'full',
			},
			{
				path: 'logout',
				component: NbLogoutComponent,
			},
			{
				path: 'request-password',
				component: NbRequestPasswordComponent,
			},
			{
				path: 'reset-password',
				component: NbResetPasswordComponent,
			},
		],
	},
	{
		path: 'maintenance-info',
		loadChildren: () =>
			import('app/pages/+maintenance-info/maintenance-info.module').then(
				(m) => m.MaintenanceInfoModule
			),
		canActivate: [MaintenanceModuleGuard],
	},
	{
		path: 'server-down',
		loadChildren: () =>
			import('app/pages/+server-down/server-down.module').then(
				(m) => m.ServerDownModule
			),
	},
	{ path: '**', redirectTo: '' },
];

const config: ExtraOptions = {
	useHash: true,
	enableTracing: true,
};

@NgModule({
	imports: [RouterModule.forRoot(routes, config)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
