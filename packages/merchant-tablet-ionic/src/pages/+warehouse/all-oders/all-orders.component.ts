import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	OnChanges,
	Output,
	EventEmitter,
} from '@angular/core';
import { WarehouseOrdersService } from '../../../services/warehouse-orders.service';
import { Store } from '../../../services/store.service';
import Order from '@modules/server.common/entities/Order';
import { OrderState } from '../warehouse';
import { Subscription } from 'rxjs';

@Component({
	selector: 'merchant-all-orders',
	templateUrl: 'all-orders.component.html',
	styleUrls: ['./all-orders.component.scss'],
})
export class AllOrdersComponent implements OnInit, OnDestroy, OnChanges {
	@Input()
	getWarehouseStatus: () => void;

	@Input()
	onUpdateWarehouseStatus: any;

	@Input()
	orderState: (Order) => void;

	@Input()
	focusedOrder: Order;

	@Input()
	isOrderContainerLive: boolean;

	@Output()
	toggleOrderContainer: EventEmitter<boolean> = new EventEmitter();

	orders: Order[] = [];
	ordersCount: number;
	OrderState: any = OrderState;
	page: number = 1;
	ordersLoaded: boolean;

	private orders$: Subscription;

	constructor(
		private warehouseOrdersService: WarehouseOrdersService,
		private store: Store
	) {}

	ngOnInit() {
		this.loadAllOrders();
	}

	ngOnChanges() {
		if (this.focusedOrder) {
			this.orders = [this.focusedOrder];
		} else {
			this.orders = [];
			this.page = 1;
			this.loadAllOrders();
		}
	}

	async loadPage(page: number) {
		if (this.orders$) {
			await this.orders$.unsubscribe();
		}

		this.orders$ = this.warehouseOrdersService
			.getStoreOrdersTableData(
				this.store.warehouseId,
				{
					sort: {
						field: '_createdAt',
						sortBy: 'desc',
					},
					skip: (page - 1) * 10,
					limit: 10,
				},
				'all'
			)
			.subscribe(async (res) => {
				const orders = res['orders'];
				await this.loadOrdersCount();

				if (!this.focusedOrder) {
					this.page = page;
					this.orders = orders;
				}
				this.ordersLoaded = true;
			});
	}

	ngOnDestroy() {
		if (this.orders$) {
			this.orders$.unsubscribe();
		}
	}

	private async loadAllOrders() {
		await this.loadOrdersCount();
		this.loadPage(1);
	}

	private async loadOrdersCount() {
		this.ordersCount = await this.warehouseOrdersService.getCountOfStoreOrders(
			this.store.warehouseId,
			'all'
		);
	}
}
