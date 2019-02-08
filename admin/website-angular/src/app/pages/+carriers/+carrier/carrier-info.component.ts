import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	template: `
		<div class="modal-header">
			<h3>{{ 'CARRIERS_VIEW.CARRIER_PAGE.CARRIER_INFO' | translate }}</h3>
			<button class="close" aria-label="Close" (click)="cancel()">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		<div class="modal-body">
			<h6>
				<strong
					>{{
						'CARRIERS_VIEW.CARRIER_PAGE.CARRIER_ID' | translate
					}}:</strong
				>
				{{ carrierId }}
			</h6>
		</div>
	`
})
export class CarrierTableInfoComponent implements OnInit {
	public carrierId: string;

	constructor(private readonly activeModal: NgbActiveModal) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	ngOnInit(): void {}
}
