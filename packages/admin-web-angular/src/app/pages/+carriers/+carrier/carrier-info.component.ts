import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	templateUrl: './carrier-info.component.html',
})
export class CarrierTableInfoComponent implements OnInit {
	public carrierId: string;

	constructor(private readonly activeModal: NgbActiveModal) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	ngOnInit(): void {}
}
