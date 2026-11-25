import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { IssuePage } from './issue.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

// Shown as a modal only. Its old route ("/issue") could never match: a path
// cannot start with a slash, which the Angular 22 router rejects in dev mode.
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule.forChild(),
    ],
    declarations: [IssuePage]
})
export class IssuePageModule {}
