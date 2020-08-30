import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from './users.service';
import { StateService } from './state.service';
import { SmartTableService } from './smart-table.service';
import { CarriersService } from './carriers.service';
import { DeviceService } from './device.service';
import { OrdersService } from './orders.service';
import { ProductsService } from './products.service';
import { ProductsCategoryService } from './productsCategory.service';
import { WarehousesService } from './warehouses.service';
import { WarehouseOrdersService } from './warehouseOrders.service';
import { Store } from './store.service';
import { DataService } from './data.service';

const SERVICES = [
	DataService,
	CarriersService,
	DeviceService,
	OrdersService,
	UsersService,
	ProductsService,
	ProductsCategoryService,
	WarehousesService,
	WarehouseOrdersService,
	Store,
	StateService,
	SmartTableService,
];

@NgModule({
	imports: [CommonModule],
	providers: [...SERVICES],
})
export class DataModule {
	static forRoot(): ModuleWithProviders<DataModule> {
		const providers: ModuleWithProviders<DataModule> = {
			ngModule: DataModule,
			providers: [...SERVICES],
		};

		return providers;
	}
}
