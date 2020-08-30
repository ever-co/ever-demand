import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/operators/map';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import User from '@modules/server.common/entities/User';
import { WarehousesService } from '../../../../../@core/data/warehouses.service';
import { ToasterService } from 'angular2-toaster';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { Subject } from 'rxjs';
import { getIdFromTheDate } from '@modules/server.common/utils';
import Order from '@modules/server.common/entities/Order';
import { IOrderCreateInput } from '@modules/server.common/routers/IWarehouseOrdersRouter';

@Component({
	selector: 'ea-custom-order',
	templateUrl: './custom-order.component.html',
	styleUrls: ['./custom-order.component.scss'],
})
export class CustomOrderComponent implements OnInit, OnDestroy {
	private readonly ngDestroy$ = new Subject<void>();

	@Input()
	warehouseId: Warehouse['id'];

	@Input()
	currentProduct: any;

	@Input()
	userId: User['id'];

	readonly form: FormGroup = this.fb.group({
		count: [
			0,
			[
				Validators.required,
				Validators.min(1),
				(control: FormControl) => {
					if (
						this.currentProduct != null &&
						control.value >
							this.currentProduct.warehouseProduct.count
					) {
						return { notEnoughAvailable: true };
					}

					return null;
				},
			],
		],
	});

	get count(): AbstractControl {
		return this.form.get('count');
	}

	constructor(
		private readonly warehouseRouter: WarehouseRouter,
		private readonly activatedRoute: ActivatedRoute,
		private readonly activeModal: NgbActiveModal,
		private readonly toasterService: ToasterService,
		private readonly warehousesService: WarehousesService,
		private readonly fb: FormBuilder,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter
	) {}

	ngOnInit() {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	async createOrder() {
		try {
			const orderCreateInput: IOrderCreateInput = {
				userId: this.userId,
				warehouseId: this.warehouseId,
				products: [
					{
						count: this.count.value,
						productId: this.currentProduct.warehouseProduct.product[
							'id'
						],
					},
				],
			};

			const order: Order = await this.warehouseOrdersRouter.create(
				orderCreateInput
			);

			this.toasterService.pop(
				'success',
				`Order #${getIdFromTheDate(order)} was created`
			);

			this.activeModal.close(order);
		} catch (err) {
			this.toasterService.pop(
				'error',
				`Error in creating order: "${err.message}"`
			);
		}
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
