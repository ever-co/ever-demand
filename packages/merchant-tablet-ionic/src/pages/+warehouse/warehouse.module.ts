import { NgModule } from '@angular/core';
import { WarehousePage } from './warehouse';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderModule } from '../../components/order/order.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { AllOrdersComponent } from './all-oders/all-orders.component';
import { WarehouseOrdersService } from '../../services/warehouse-orders.service';
import { Store } from '../../services/store.service';
import { RelevantOrdersComponent } from './relevant-oders/relevant-orders.component';
import { WarehouseCommonModule } from './common/warehouse.common.module';
import { CommonModule } from '@angular/common';
import { AllProductsComponent } from './all-products/all-products.component';
import { TopProductsComponent } from './top-products/top-products.component';
import { WarehouseProductsService } from '../../services/warehouse-products.service';
import { NgxMasonryModule } from 'ngx-masonry';
import { Routes, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/ion-content';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonInfiniteScroll } from '@ionic/angular/ion-infinite-scroll';
import { IonInfiniteScrollContent } from '@ionic/angular/ion-infinite-scroll-content';
import { IonItem } from '@ionic/angular/ion-item';
import { IonList } from '@ionic/angular/ion-list';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { IonRow } from '@ionic/angular/ion-row';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { ModalController } from '@ionic/angular/modal-controller';
import { PopoverController } from '@ionic/angular/popover-controller';
import { CreateProductTypePopupPageModule } from './create-product-type-popup/create-product-type-popup.module';
import { EditProductTypePopupPageModule } from './edit-product-type-popup/edit-product-type-popup.module';
import { WarehousesService } from '../../services/warehouses.service';
import { OrderStatusFilterPipe } from './warehouse.pipe';


const routes: Routes = [
	{
		path: '',
		component: WarehousePage,
	},
];

@NgModule({
	declarations: [
		WarehousePage,
		AllOrdersComponent,
		RelevantOrdersComponent,
		AllProductsComponent,
		TopProductsComponent,
		OrderStatusFilterPipe,
	],
	imports: [
		ComponentsModule,
		OrderModule,
		CommonModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		NgxPaginationModule,
		WarehouseCommonModule,
		NgxMasonryModule,
		CreateProductTypePopupPageModule,
		EditProductTypePopupPageModule,
		IonContent,
		IonIcon,
		IonInfiniteScroll,
		IonInfiniteScrollContent,
		IonItem,
		IonList,
		IonMenuToggle,
		IonRow,
		IonSelect,
		IonSelectOption,
		IonSpinner,
	],
	providers: [
		WarehouseOrdersService,
		Store,
		WarehouseProductsService,
		WarehousesService,
		ModalController,
		PopoverController,
	],
})
export class WarehousePageModule {}
