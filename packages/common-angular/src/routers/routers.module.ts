import { NgModule } from '@angular/core';
import { CommonLibModule } from '../lib';
import { CarrierOrdersRouter } from './carrier-orders-router.service';
import { InviteRequestRouter } from './invite-request-router.service';
import { ProductRouter } from './product-router.service';
import { InviteRouter } from './invite-router.service';
import { GeoLocationWarehousesRouter } from './geo-location-warehouses-router.service';
import { GeoLocationProductsRouter } from './geo-location-products-router.service';
import { CarrierRouter } from './carrier-router.service';
import { DeviceRouter } from './device-router.service';
import { GeoLocationOrdersRouter } from './geo-location-orders-router.service';
import { OrderRouter } from './order-router.service';
import { UserRouter } from './user-router.service';
import { WarehouseCarriersRouter } from './warehouse-carriers-router.service';
import { WarehouseProductsRouter } from './warehouse-products-router.service';
import { WarehouseRouter } from './warehouse-router.service';
import { UserProductsRouter } from './user-products-router.service';
import { WarehouseOrdersRouter } from './warehouse-orders-router.service';
import { UserOrdersRouter } from './user-orders-router.service';
import { UserAuthRouter } from './user-auth-router.service';
import { GeoLocationRouter } from './geo-location-router.service';

@NgModule({
	imports: [CommonLibModule],
	exports: [],
	declarations: [],
	providers: [
		CarrierOrdersRouter,
		CarrierRouter,
		DeviceRouter,
		GeoLocationOrdersRouter,
		GeoLocationProductsRouter,
		GeoLocationWarehousesRouter,
		GeoLocationRouter,
		InviteRequestRouter,
		InviteRouter,
		OrderRouter,
		ProductRouter,
		UserOrdersRouter,
		UserRouter,
		UserAuthRouter,
		WarehouseCarriersRouter,
		WarehouseRouter,
		WarehouseProductsRouter,
		WarehouseOrdersRouter,
		UserProductsRouter,
	],
})
export class RoutersModule {}
