import { Component, Input, Output, EventEmitter } from '@angular/core';
import Carrier from '@modules/server.common/entities/Carrier';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';

@Component({
	selector: 'ea-carrier-info',
	styleUrls: ['carrier-info.component.scss'],
	templateUrl: 'carrier-info.component.html',
})
export class CarrierInfoComponent {
	@Input()
	carrier: Carrier;

	@Output()
	getChangeCarrier = new EventEmitter<Carrier>();

	public showCode: boolean = false;
	public loading: boolean;
	constructor(private carrierRouter: CarrierRouter) {}

	async toogleStatus() {
		this.loading = true;
		const isOnline = this.carrier.status === CarrierStatus.Online;
		const carrier = await this.carrierRouter.updateStatus(
			this.carrier.id,
			isOnline ? CarrierStatus.Offline : CarrierStatus.Online
		);
		this.getChangeCarrier.emit(carrier);
		this.loading = false;
	}
}
