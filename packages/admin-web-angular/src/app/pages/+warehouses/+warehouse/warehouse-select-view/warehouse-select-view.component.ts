import {
	Component,
	ViewChild,
	OnInit,
	OnDestroy,
	EventEmitter,
	Input,
	OnChanges,
	Output,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { WizardComponent } from 'angular2-wizard';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { JsonModalComponent } from '../../../../@shared/json-modal/json-modal.component';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import Order from '@modules/server.common/entities/Order';

@Component({
	selector: 'ea-warehouse-select-view',
	styleUrls: ['./warehouse-select-view.component.scss'],
	templateUrl: './warehouse-select-view.component.html',
})
export class WarehouseSelectViewComponent
	implements OnInit, OnDestroy, OnChanges {
	private _ngDestroy$ = new Subject<void>();

	@Output()
	selectWarehouseEvent = new EventEmitter();

	@Input()
	public warehouses: Warehouse[];

	@Input()
	public selectedWarehouse: Warehouse;

	public warehouse: Warehouse;

	constructor(
		private readonly _router: Router,
		private readonly modalService: NgbModal,
		private warehouseRouter: WarehouseRouter,
		private readonly _route: ActivatedRoute,
		private readonly _toasterService: ToasterService
	) {}

	ngOnChanges() {}
	ngOnInit() {}

	protected selectWarehouse(warehouse: Warehouse) {
		this.warehouse = warehouse;
		this.selectWarehouseEvent.emit(warehouse);
		console.log(this.selectedWarehouse);
	}

	openInfo() {
		const activeModal = this.modalService.open(JsonModalComponent, {
			size: 'lg',
			container: 'nb-layout',
			windowClass: 'simJSON',
		});

		const modalComponent: JsonModalComponent =
			activeModal.componentInstance;
		if (this.warehouse !== undefined) {
			modalComponent.obj = this.warehouse;
			modalComponent.title = 'Warehouse';
			modalComponent.subTitle = this.warehouse.name;
		}
		modalComponent.obj = this.selectedWarehouse;
		modalComponent.title = 'Warehouse';
		modalComponent.subTitle = this.selectedWarehouse.name;
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
