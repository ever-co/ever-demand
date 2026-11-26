import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonRow } from '@ionic/angular';
import { CancelPage } from './cancel.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

// Shown as a modal only. Its old route ("/cancel-page") could never match: a path
// cannot start with a slash, which the Angular 22 router rejects in dev mode.
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonRow,
        TranslateModule.forChild(),
    ],
    declarations: [CancelPage]
})
export class CancelPageModule {}
