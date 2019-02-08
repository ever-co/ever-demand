import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '../../../@theme';
import { AccountComponent } from './account/account.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { FileUploadModule } from 'ng2-file-upload';
import { NbSpinnerModule } from '@nebular/theme';

const EDIT_PROFILE_COMPONENTS = [AccountComponent, BasicInfoComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
		FileUploadModule,
		NbSpinnerModule
	],
	declarations: [...EDIT_PROFILE_COMPONENTS],
	exports: [...EDIT_PROFILE_COMPONENTS],
	entryComponents: [],

	providers: []
})
export class EditProfileModule {}
