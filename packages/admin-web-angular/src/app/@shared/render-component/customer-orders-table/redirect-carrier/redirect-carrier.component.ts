import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Carrier from '@modules/server.common/entities/Carrier';
import { CarriersService } from '../../../../@core/data/carriers.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	styleUrls: ['./redirect-carrier.component.scss'],
	templateUrl: './redirect-carrier.component.html',
})
export class RedirectCarrierComponent implements ViewCell, OnInit {
	value: string | number;

	@Input()
	rowData: any;
	carrier$: Observable<Carrier>;

	public carrierStatusText: string;

	constructor(
		private readonly router: Router,
		private readonly carriersService: CarriersService,
		private translate: TranslateService
	) {}

	ngOnInit() {
		if (this.rowData.carrierId) {
			this.carrier$ = this.carriersService.getCarrierById(
				this.rowData.carrierId
			);
		}
		this.carrierStatusText =
			'STATUS_TEXT.' + this.rowData.carrierStatusText;
	}
	redirect() {
		if (this.rowData.carrierId) {
			this.router.navigate([`carriers/${this.rowData.carrierId}`]);
		}
	}
}
