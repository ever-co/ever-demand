import { NgModule } from '@angular/core';
import { UserMutationComponent } from './user-mutation.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { UserFormsModule } from '../forms/user-forms.module';
import { GoogleMapModule } from '../../google-map/google-map.module';
import { UsersService } from '../../../services/users.service';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        TranslateModule.forChild(),
        UserFormsModule,
        GoogleMapModule,
        IonicModule,
        CommonModule,
        FormsModule,
    ],
    providers: [UsersService],
    exports: [UserMutationComponent],
    declarations: [UserMutationComponent]
})
export class UserMutationModule {}
