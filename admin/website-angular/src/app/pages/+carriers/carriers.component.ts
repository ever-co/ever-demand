import { Component, OnDestroy, ViewChild } from '@angular/core';

import { CarriersService } from '../../@core/data/carriers.service';
import { CarrierMutationComponent } from '../../@shared/carrier/carrier-mutation';
import { Subject } from 'rxjs/Rx';
import { ToasterService } from 'angular2-toaster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { CarriersSmartTableComponent } from 'app/@shared/carrier/carriers-table/carriers-table.component';

@Component({
	selector: 'ea-carriers',
	templateUrl: 'carriers.component.html',
	styleUrls: ['carriers.component.scss']
})
export class CarriersComponent implements OnDestroy {
	@ViewChild('carriersTable')
	carriersTable: CarriersSmartTableComponent;

	loading: boolean;

	private ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _carriersService: CarriersService,
		private readonly _toasterService: ToasterService,
		private readonly modalService: NgbModal
	) {}

	openWizardNewCarrier() {
		this.modalService.open(CarrierMutationComponent, {
			size: 'lg',
			container: 'nb-layout',
			windowClass: 'ng-custom',
			backdrop: 'static'
		});
	}

	deleteSelectedCarriers() {
		const idsForDelete: string[] = this.carriersTable.selectedCarriers.map(
			(c) => c.id
		);
		this.loading = true;

		try {
			this._carriersService.removeByIds(idsForDelete).subscribe(() => {
				this.carriersTable.selectedCarriers.forEach((carrier) =>
					this._toasterService.pop(
						`success`,
						`Carrier ${carrier['name']} DELETED`
					)
				);
				this.carriersTable.selectedCarriers = [];
			});
			this.loading = false;
		} catch (error) {
			this.loading = false;
			this._toasterService.pop(`error`, `${error.message}`);
		}
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
