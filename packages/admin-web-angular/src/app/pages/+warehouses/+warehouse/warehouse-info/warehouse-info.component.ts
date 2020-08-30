import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { Router } from '@angular/router';

@Component({
	templateUrl: 'warehouse-info.component.html',
	styleUrls: ['warehouse-info.component.scss'],
})
export class WarehouseTableInfoComponent implements OnInit {
	public warehouse: Warehouse;

	constructor(
		private readonly activeModal: NgbActiveModal,
		private router: Router
	) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	ngOnInit(): void {}

	redirectToWarehousePage() {
		this.router.navigate([`/stores/${this.warehouse.id}`]);
		this.activeModal.dismiss('canceled');
	}
}
