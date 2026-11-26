import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { MenuComponent } from './menu.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
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
