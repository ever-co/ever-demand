import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { WarehouseViewModel } from '../../../../models/WarehouseViewModel';
import { WarehousesService } from '../../../../@core/data/warehouses.service';
import { OrdersService } from '../../../../@core/data/orders.service';
import { WarehouseMutationComponent } from '../../../../@shared/warehouse/warehouse-mutation';
import User from '@modules/server.common/entities/User';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { ToasterService } from 'angular2-toaster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';

@Component({
	selector: 'ea-customer-stores',
	styleUrls: ['./ea-customer-stores.component.scss'],
	templateUrl: './ea-customer-stores.component.html',
})
export class CustomerStoresComponent implements OnInit, OnDestroy {
	@Input()
	currentUser: User;

	params$: any;

	protected sourceEventEmitter = new EventEmitter<WarehouseViewModel[]>();

	private _selectedCustomerDestroy$ = new Subject<void>();
	private _ngDestroy$ = new Subject<void>();

	private _selectedWarehouses: WarehouseViewModel[] = [];

	constructor(
		private readonly _toasterService: ToasterService,
		private readonly _modalService: NgbModal,
		private readonly _warehousesService: WarehousesService,
		private readonly _ordersService: OrdersService,
		private readonly _router: ActivatedRoute,
		private userRouter: UserRouter
	) {
		this.params$ = this._router.params.subscribe(async (res) => {
			const user = await this.userRouter
				.get(res.id)
				.pipe(first())
				.toPromise();
			this._destroyExceptSelectedCustomerSubscriber();
			this.currentUser = user;
			if (this.currentUser) {
				this._loadNearbyWarehouses();
			}
		});
	}

	get hasSelectedWarehouses(): boolean {
		return this._selectedWarehouses.length > 0;
	}

	ngOnInit() {
		if (this.currentUser) {
			this._loadNearbyWarehouses();
		}
	}

	createWarehouseModel() {
		this._modalService.open(WarehouseMutationComponent, {
			size: 'lg',
			container: 'nb-layout',
		});
	}

	deleteSelectedRows() {
		const idsForDelete: string[] = this._selectedWarehouses.map(
			(w) => w.id
		);

		this._warehousesService.removeByIds(idsForDelete).subscribe(() => {
			this._selectedWarehouses.forEach((warehouse) =>
				this._toasterService.pop(
					`success`,
					`Warehouse '${warehouse.name}' DELETED`
				)
			);
			this._selectedWarehouses = [];
		});
	}

	selectWarehouseTmp(ev) {
		this._selectedWarehouses = ev.selected;
	}

	private _destroyExceptSelectedCustomerSubscriber() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
		this._ngDestroy$ = new Subject<void>();
	}

	private async _setupStoresData(warehouses) {
		const merchantsOrders = await this._ordersService.getMerchantsOrdersCountInfo(
			warehouses.map((w) => w.id)
		);

		const noInfoSign = '';

		const sourceResult = warehouses.map((warehouse) => {
			const merchantOrders = merchantsOrders.find(
				(res) => res['id'] === warehouse.id
			);
			return {
				id: warehouse.id,
				name: warehouse.name || noInfoSign,
				email: warehouse.contactEmail || noInfoSign,
				phone: warehouse.contactPhone || noInfoSign,
				city: warehouse.geoLocation.city || noInfoSign,
				address: `
					St. ${warehouse.geoLocation.streetAddress || noInfoSign}, House № ${
					warehouse.geoLocation.house || noInfoSign
				}
				`,
				ordersQty: merchantOrders ? merchantOrders.ordersCount : 0,
				actions: {
					actionName: 'Order',
					actionOwnerId: this.currentUser.id,
				},
			};
		});

		return sourceResult;
	}

	private _loadNearbyWarehouses() {
		const emitSource = async (stores) => {
			const sourceResult = await this._setupStoresData(stores);
			this.sourceEventEmitter.emit(sourceResult);
		};

		const {
			loc: { type, coordinates },
		} = this.currentUser.geoLocation;
		const geoInput = { loc: { type, coordinates } } as GeoLocation;

		const stores$ = this._warehousesService.getNearbyStores(geoInput);

		combineLatest(stores$)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((res) => {
				const stores: Warehouse[] = res[0];
				emitSource(stores);
			});
	}

	ngOnDestroy() {
		this._selectedCustomerDestroy$.next();
		this._selectedCustomerDestroy$.complete();

		this._ngDestroy$.next();
		this._ngDestroy$.complete();

		if (this.params$) {
			this.params$.unsubscribe();
		}
	}
}
