import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '../../@theme';
import { ProfileComponent } from './profile.component';
import { AdminsService } from '../../@core/data/admins.service';
import { EditProfileModule } from './edit/edit.module';

export const routes: Routes = [
	{
		path: '',
		component: ProfileComponent,
	},
];

const PROFILE_COMPONENTS = [ProfileComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		EditProfileModule,
	],
	declarations: [...PROFILE_COMPONENTS],

	entryComponents: [],

	providers: [AdminsService],
})
export class ProfileModule {}
