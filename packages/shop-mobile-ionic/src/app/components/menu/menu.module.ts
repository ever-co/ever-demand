import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	IonContent,
	IonHeader,
	IonIcon,
	IonItem,
	IonItemDivider,
	IonItemGroup,
	IonLabel,
	IonList,
	IonMenu,
	IonMenuToggle,
	IonRouterLink,
	IonTitle,
	IonToolbar,
} from '@ionic/angular';
import { MenuComponent } from './menu.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { SubMenuComponent } from './submenu/submenu.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		IonContent,
		IonHeader,
		IonIcon,
		IonItem,
		IonItemDivider,
		IonItemGroup,
		IonLabel,
		IonList,
		IonMenu,
		IonMenuToggle,
		IonRouterLink,
		IonTitle,
		IonToolbar,
		TranslateModule.forChild(),
	],
	exports: [MenuComponent, SubMenuComponent],
	declarations: [MenuComponent, SubMenuComponent],
})
export class MenuModule {}
