import { NgModule } from '@angular/core';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { DetailsInfoFormComponent } from './details-info/details-info-form.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const COMPONENTS = [BasicInfoFormComponent, DetailsInfoFormComponent];

@NgModule({
	declarations: COMPONENTS,
	exports: COMPONENTS,
	imports: [IonicModule, FormsModule, ReactiveFormsModule],
})
export class PromotionFormsModule {}
