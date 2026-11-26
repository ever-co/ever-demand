import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItem } from '@ionic/angular/ion-item';
import { IonItemGroup } from '@ionic/angular/ion-item-group';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonMenu } from '@ionic/angular/ion-menu';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { IonRouterLink } from '@ionic/angular/ion-router-link';
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
