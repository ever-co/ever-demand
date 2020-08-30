import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
	styleUrls: ['warehouse-info.component.scss'],
	templateUrl: 'warehouse-info.component.html',
})
export class WarehouseInfoComponent implements OnInit {
	public warehouseId: string;
	showCode: boolean = false;

	public selectedWarehouse: any;

	constructor(
		private readonly activeModal: NgbActiveModal,
		private router: Router
	) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	ngOnInit(): void {
		console.log(this.selectedWarehouse);
	}
	redirectToWarehousePage() {
		this.router.navigate([`/stores/${this.warehouseId}`]);
		this.activeModal.dismiss('canceled');
	}
}
