import {
	Component,
	Input,
	ViewChild,
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
			this.loadAllOrders();
		}
	}

	ngAfterViewInit() {}

	async loadData(event = null) {
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
				'relevant'
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

	private async loadAllOrders() {
		await this.loadOrdersCount();

		this.orders = [];

		this.page = 1;

		for (const sub of this.subscriptions) {
			await sub.unsubscribe();
		}

		this.subscriptions = [];

		this.loadedPages = [];

		this.loadData();
	}

	private async loadOrdersCount() {
		this.ordersCount = await this.warehouseOrdersService.getCountOfStoreOrders(
			this.store.warehouseId,
			'relevant'
		);
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
