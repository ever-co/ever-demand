import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CarriersService } from '@app/@core/data/carriers.service';
import Carrier from '@modules/server.common/entities/Carrier';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
	templateUrl: './carrier-info.component.html',
	styles: ['.carrier-redirect { cursor: pointer; margin-left: 5px}'],
})
export class CarrierTableInfoComponent implements OnInit {
	public carrierId: string;
	public carrierData: Carrier | any = {};

	constructor(
		private readonly activeModal: NgbActiveModal,
		private readonly carrierService: CarriersService,
		private readonly router: Router
	) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	ngOnInit(): void {
		this.carrierService
			.getCarrierById(this.carrierId)
			.pipe(first())
			.subscribe((data) => {
				this.carrierData = data;
			});
	}

	redirectToCarrierPage() {
		this.router.navigate([`/carriers/${this.carrierId}`]);
		this.cancel();
	}
}
