import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ElapsedTimeComponent } from './elapsed-time.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule.forChild(),
    ],
    declarations: [ElapsedTimeComponent],
    exports: [ElapsedTimeComponent]
})
export class ElapsedTimeModule {}
