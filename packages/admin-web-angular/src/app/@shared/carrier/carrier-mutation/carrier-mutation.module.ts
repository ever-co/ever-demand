import { NgModule } from '@angular/core';
import { CarrierMutationComponent } from './carrier-mutation.component';
import { ThemeModule } from '../../../@theme/theme.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FormWizardModule } from '@app/@shared/wizard';
import { LocationFormModule } from '../../forms/location';
import { CarrierFormsModule } from '../forms';
import { GoogleMapModule } from '../../forms/google-map/google-map.module';
import { NbSpinnerModule } from '@nebular/theme';

@NgModule({
    imports: [
        ThemeModule,
        FormWizardModule,
        TranslateModule.forChild(),
        CarrierFormsModule,
        LocationFormModule,
        GoogleMapModule,
        NbSpinnerModule,
    ],
    exports: [CarrierMutationComponent],
    declarations: [CarrierMutationComponent]
})
export class CarrierMutationModule {}
