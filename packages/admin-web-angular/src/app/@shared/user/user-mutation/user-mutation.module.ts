import { NgModule } from '@angular/core';
import { UserMutationComponent } from './user-mutation.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FormWizardModule } from '@app/@shared/wizard';
import { ThemeModule } from '../../../@theme/theme.module';
import { UserFormsModule } from '../forms';
import { LocationFormModule } from '../../forms/location';
import { GoogleMapModule } from '../../forms/google-map/google-map.module';
import { NbSpinnerModule } from '@nebular/theme';

@NgModule({
    imports: [
        ThemeModule,
        FormWizardModule,
        TranslateModule.forChild(),
        UserFormsModule,
        LocationFormModule,
        GoogleMapModule,
        NbSpinnerModule,
    ],
    exports: [UserMutationComponent],
    declarations: [UserMutationComponent]
})
export class UserMutationModule {}
