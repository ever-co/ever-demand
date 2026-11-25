import { NgModule } from '@angular/core';
import { CarrierTrackingComponent } from './carrier-tracking/carrier-tracking.component';
import { TrackComponent } from './track.component';
import { FormWizardModule } from '@app/@shared/wizard';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { FileUploadModule } from 'ng2-file-upload';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ThemeModule } from '@app/@theme';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        FormWizardModule,
        Ng2SmartTableModule,
        FileUploadModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
        ThemeModule,
        NgSelectModule,
    ],
    declarations: [TrackComponent, CarrierTrackingComponent],
    providers: [NgbActiveModal]
})
export class TrackModule {}
