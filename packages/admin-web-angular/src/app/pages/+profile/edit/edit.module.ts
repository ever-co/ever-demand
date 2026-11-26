import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterModule } from '@app/@core/toaster';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ThemeModule } from '../../../@theme';
import { AccountComponent } from './account/account.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { FileUploaderModule } from '@app/@shared/file-uploader/file-uploader.module';

const EDIT_PROFILE_COMPONENTS = [AccountComponent, BasicInfoComponent];

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        ToasterModule.forRoot(),
        TranslateModule.forChild(),
        FileUploaderModule,
        NbSpinnerModule,
        NbButtonModule,
    ],
    declarations: [...EDIT_PROFILE_COMPONENTS],
    exports: [...EDIT_PROFILE_COMPONENTS],
    providers: []
})
export class EditProfileModule {}
