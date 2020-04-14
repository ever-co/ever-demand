import { Component, ViewChild, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first, map, switchMap } from 'rxjs/operators';
import { ToasterService } from 'angular2-toaster';
import { BasicInfoFormComponent } from '../../../../@shared/user/forms';
import { LocationFormComponent } from '../../../../@shared/forms/location';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import User from '@modules/server.common/entities/User';

@Component({
	templateUrl: './customer-edit.component.html',
	styleUrls: ['./customer-edit.component.scss'],
})
export class CustomerEditComponent implements OnInit {
	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('locationForm')
	locationForm: LocationFormComponent;

	mapTypeEmitter = new EventEmitter<string>();
	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();

	public loading: boolean;

	readonly form: FormGroup = this._formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
		location: LocationFormComponent.buildForm(this._formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly location = this.form.get('location') as FormControl;

	readonly customerId$ = this._activatedRoute.params.pipe(
		map((p) => p['id'])
	);

	readonly customer$ = this.customerId$.pipe(
		switchMap((id) => {
			return this._customerRouter.get(id).pipe(first());
		})
	);

	private _currentCustomer: User;

	constructor(
		private readonly _activatedRoute: ActivatedRoute,
		private readonly _router: Router,
		private readonly _formBuilder: FormBuilder,
		private readonly _customerRouter: UserRouter,
		private readonly _toasterService: ToasterService
	) {}

	ngOnInit() {
		this.customer$
			.withLatestFrom(this.customerId$)
			.subscribe(([customer, id]) => {
				if (!customer) {
					this._toasterService.pop(
						'error',
						`Customer with id ${id} doesn't exist!`
					);
				}

				this._currentCustomer = customer;

				// GeoJSON use reversed order of lat => lng
				const geoLocationInput = customer.geoLocation;
				geoLocationInput.loc.coordinates.reverse();

				this.basicInfoForm.setValue(customer);
				this.locationForm.setValue(geoLocationInput);
				this._emitMapCoordinates([
					customer.geoLocation.coordinates.lat,
					customer.geoLocation.coordinates.lng,
				]);
			});
	}

	onCoordinatesChanges(coords: number[]) {
		this.mapCoordEmitter.emit(coords);
	}

	onGeometrySend(geometry: any) {
		this.mapGeometryEmitter.emit(geometry);
	}

	emitMapType(mapType: string) {
		this.mapTypeEmitter.emit(mapType);
	}

	private _emitMapCoordinates(coords: number[]) {
		this.mapCoordEmitter.emit(coords);
	}

	protected async updateCustomer() {
		const geoLocationInput = this.locationForm.getValue();
		geoLocationInput.loc.coordinates.reverse();
		try {
			this.loading = true;
			const customer = await this._customerRouter.updateUser(
				this._currentCustomer.id,
				{
					...this.basicInfoForm.getValue(),
					geoLocation: geoLocationInput as IGeoLocation,
				}
			);
			this.loading = false;
			this._toasterService.pop(
				'success',
				`Customer ${customer.firstName} was updated`
			);
			await this._router.navigate([`/customers/list/${customer.id}`], {
				relativeTo: this._activatedRoute,
			});
		} catch (err) {
			this.loading = false;
			this._toasterService.pop(
				'error',
				`Error in updating customer: "${err.message}"`
			);
		}
	}
}
