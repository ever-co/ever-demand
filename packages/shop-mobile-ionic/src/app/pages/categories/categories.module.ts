import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { CategoriesPage } from './categories.page';

const routes: Routes = [
  {
    path: '',
    component: CategoriesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  declarations: [CategoriesPage]
})
export class CategoriesPageModule {}

//CategoriesPageRoutingModule inside imports for NgModule
/*import { CategoriesPageRoutingModule } from './categories-routing.module';*/
