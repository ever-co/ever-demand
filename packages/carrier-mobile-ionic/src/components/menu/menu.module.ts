import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MenuComponent } from './menu.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SubMenuComponent } from './submenu/submenu.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		IonicModule,
		TranslateModule.forChild(),
	],
	exports: [MenuComponent, SubMenuComponent],
	declarations: [MenuComponent, SubMenuComponent],
})
export class MenuModule {}
