import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import {
	FormGroup,
	FormBuilder,
	Validators,
	AbstractControl,
} from '@angular/forms';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { AlertController } from '@ionic/angular';
import User from '@modules/server.common/entities/User';

@Component({
	selector: 'home-address',
	templateUrl: 'home-address.component.html',
})
export class HomeAddressComponent implements OnInit, OnChanges, OnDestroy {
	@Input()
	private currCutomer: User;

	ngOnInit() {}

	ngOnChanges() {}

	ngOnDestroy() {}
}
