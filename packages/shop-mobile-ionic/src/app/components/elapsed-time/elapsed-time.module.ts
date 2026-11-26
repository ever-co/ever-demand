import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ElapsedTimeComponent } from './elapsed-time.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule.forChild(),
    ],
    declarations: [ElapsedTimeComponent],
    exports: [ElapsedTimeComponent]
})
export class ElapsedTimeModule {}
