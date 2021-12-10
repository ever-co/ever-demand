import { NgModule } from '@angular/core';
import { FormWizardModule } from '@ever-co/angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FileUploadModule } from 'ng2-file-upload';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '@app/@theme';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehouseTrackComponent } from './warehouse-track.component';

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
    declarations: [WarehouseTrackComponent],
    providers: [NgbActiveModal]
})
export class WarehouseTrackModule {}
