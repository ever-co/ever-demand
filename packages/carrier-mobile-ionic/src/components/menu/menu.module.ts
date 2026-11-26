import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	IonContent,
	IonHeader,
	IonIcon,
	IonItem,
	IonItemGroup,
	IonLabel,
	IonList,
	IonMenu,
	IonMenuToggle,
	IonRouterLink,
} from '@ionic/angular';
import { MenuComponent } from './menu.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { SubMenuComponent } from './submenu/submenu.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		TranslateModule.forChild(),
		IonContent,
		IonHeader,
		IonIcon,
		IonItem,
		IonItemGroup,
		IonLabel,
		IonList,
		IonMenu,
		IonMenuToggle,
		IonRouterLink,
	],
	exports: [MenuComponent, SubMenuComponent],
	declarations: [MenuComponent, SubMenuComponent],
})
export class MenuModule {}
