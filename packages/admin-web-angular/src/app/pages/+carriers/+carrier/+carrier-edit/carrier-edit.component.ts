import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BasicInfoFormComponent } from '../../../../@shared/carrier/forms';
import { LocationFormComponent } from '../../../../@shared/forms/location';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import Carrier from '@modules/server.common/entities/Carrier';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import { ToasterService } from 'angular2-toaster';
import { first, map, switchMap } from 'rxjs/operators';

@Component({
	selector: 'ea-carrier-edit',
	templateUrl: './carrier-edit.component.html',
	styleUrls: ['./carrier-edit.component.scss'],
})
export class CarrierEditComponent implements OnInit {
	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('locationForm')
	locationForm: LocationFormComponent;

	mapTypeEmitter = new EventEmitter<string>();
	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();

	public loading: boolean;

	readonly form: FormGroup = this.formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
		location: LocationFormComponent.buildForm(this.formBuilder),
		apartment: LocationFormComponent.buildApartmentForm(this.formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly location = this.form.get('location') as FormControl;
	readonly apartment = this.form.get('apartment') as FormControl;

	readonly carrierId$ = this.activatedRoute.params.pipe(map((p) => p['id']));

	readonly carrier$ = this.carrierId$.pipe(
		switchMap((id) => {
			return this.carrierRouter.get(id).pipe(first());
		})
	);

	private currentCarrier: Carrier;

	constructor(
		private readonly toasterService: ToasterService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly formBuilder: FormBuilder,
		private readonly carrierRouter: CarrierRouter,
		private readonly router: Router
	) {}

	get isCarrierValid() {
		return this.basicInfo.valid && this.location.valid;
	}

	ngOnInit() {
		this.carrier$
			.withLatestFrom(this.carrierId$)
			.subscribe(([carrier, id]) => {
				if (!carrier) {
					this.toasterService.pop(
						'error',
						`Carrier with id ${id} doesn't exist!`
					);
				}

				this.currentCarrier = carrier;

				// GeoJSON use reversed order for coordinates from our locationForm.
				// we use lat => lng but GeoJSON use lng => lat.
				const geoLocationInput = carrier.geoLocation;
				geoLocationInput.loc.coordinates.reverse();

				this.basicInfoForm.setValue(carrier);
				this.locationForm.setValue(geoLocationInput);
				this.locationForm.setApartment(carrier.apartment);
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

	async updateCarrier() {
		try {
			const basicInfo = this.basicInfoForm.getValue();
			basicInfo['apartment'] = this.apartment.value;

			// GeoJSON use reversed order for coordinates from our implementation.
			// we use lat => lng but GeoJSON use lng => lat.
			const geoLocationInput = this.locationForm.getValue();
			geoLocationInput.loc.coordinates.reverse();

			this.loading = true;
			const carrier = await this.carrierRouter.updateById(
				this.currentCarrier.id,
				{
					...basicInfo,
					geoLocation: geoLocationInput as IGeoLocation,
				}
			);
			this.loading = false;
			this.toasterService.pop(
				'success',
				`Carrier ${carrier.firstName} was updated`
			);
		} catch (err) {
			this.loading = false;
			this.toasterService.pop(
				'error',
				`Error in updating carrier: "${err.message}"`
			);
		}
	}
}
