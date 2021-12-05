import {
	Component,
	Input,
	AfterViewInit,
	OnDestroy,
	OnChanges,
	Output,
	EventEmitter,
} from '@angular/core';
import { WarehouseOrdersService } from '../../../services/warehouse-orders.service';
import { Store } from '../../../services/store.service';
import Order from '@modules/server.common/entities/Order';
import { OrderState } from '../warehouse';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const showOrdersNumber: number = 10;
@Component({
	selector: 'merchant-relevant-orders',
	templateUrl: 'relevant-orders.component.html',
	styleUrls: ['./relevant-orders.component.scss'],
})
export class RelevantOrdersComponent
	implements AfterViewInit, OnDestroy, OnChanges, OnDestroy {
	@Input()
	getWarehouseStatus: (status: any) => void;

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

	@Input()
	filter: string;

	orders: Order[] = [];
	ordersCount: number;
	OrderState: any = OrderState;
	page: number = 1;
	ordersLoaded: boolean;

	private readonly ngDestroy$ = new Subject<void>();
	private loadedPages = [];
	private subscriptions: any = [];

	constructor(
		private warehouseOrdersService: WarehouseOrdersService,
		private store: Store
	) {}

	ngOnChanges() {
		if (this.focusedOrder) {
			this.orders = [this.focusedOrder];
		} else {
			this.loadAllOrders(this.filter ? this.filter : 'relevant');
		}
	}

	ngAfterViewInit() {}

	async loadData(event = null, status = 'relevant') {
		const sub = this.warehouseOrdersService
			.getStoreOrdersTableData(
				this.store.warehouseId,
				{
					sort: {
						field: '_createdAt',
						sortBy: 'desc',
					},
					skip: (this.page - 1) * showOrdersNumber,
					limit: showOrdersNumber,
				},
				status
			)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((res) => {
				const orders = res['orders'];
				const page = res['page'];

				if (!this.focusedOrder) {
					if (this.loadedPages.includes(res['page'])) {
						const start = (page - 1) * showOrdersNumber;
						this.orders.splice(start, showOrdersNumber, ...orders);
					} else {
						this.loadedPages.push(res['page']);
						this.orders.push(...orders);

						this.page++;
					}
					if (event) {
						event.target.complete();
					}
				}
				this.ordersLoaded = true;
			});

		this.subscriptions.push(sub);
	}

	private async loadAllOrders(status = 'relevant') {
		await this.loadOrdersCount(status);

		this.orders = [];

		this.page = 1;

		for (const sub of this.subscriptions) {
			await sub.unsubscribe();
		}

		this.subscriptions = [];

		this.loadedPages = [];

		this.loadData(null, status);
	}

	private async loadOrdersCount(status = 'relevant') {
		this.ordersCount = await this.warehouseOrdersService.getCountOfStoreOrders(
			this.store.warehouseId,
			status
		);
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
