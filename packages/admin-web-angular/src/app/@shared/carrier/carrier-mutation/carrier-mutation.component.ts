import {
	Component,
	ViewChild,
	EventEmitter,
	AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToasterService } from 'angular2-toaster';

import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { BasicInfoFormComponent } from '../forms';
import { LocationFormComponent } from '../../forms/location';

import { getDummyImage } from '@modules/server.common/utils';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ea-carrier-mutation',
	templateUrl: './carrier-mutation.component.html',
	styleUrls: ['./carrier-mutation.component.scss'],
})
export class CarrierMutationComponent implements AfterViewInit {
	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('locationForm')
	locationForm: LocationFormComponent;

	readonly form: FormGroup = this.formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
		location: LocationFormComponent.buildForm(this.formBuilder),
		password: BasicInfoFormComponent.buildPasswordForm(this.formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly location = this.form.get('location') as FormControl;
	readonly password = this.form.get('password') as FormControl;

	public loading: boolean;

	mapCoordEmitter = new EventEmitter<
		google.maps.LatLng | google.maps.LatLngLiteral
	>();
	mapGeometryEmitter = new EventEmitter<
		google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry
	>();

	public BUTTON_DONE: string = 'BUTTON_DONE';
	public BUTTON_NEXT: string = 'BUTTON_NEXT';
	public BUTTON_PREV: string = 'BUTTON_PREV';

	constructor(
		private toasterService: ToasterService,
		private readonly activeModal: NgbActiveModal,
		private readonly formBuilder: FormBuilder,
		protected carrierRouter: CarrierRouter,
		private readonly _translateService: TranslateService
	) {}

	get buttonDone() {
		return this._translate(this.BUTTON_DONE);
	}

	get buttonNext() {
		return this._translate(this.BUTTON_NEXT);
	}

	get buttonPrevious() {
		return this._translate(this.BUTTON_PREV);
	}

	ngAfterViewInit(): void {
		if (this.locationForm) {
			this.locationForm.setDefaultCoords();
		}
	}

	onGeometrySend(
		geometry:
			| google.maps.places.PlaceGeometry
			| google.maps.GeocoderGeometry
	) {
		this.mapGeometryEmitter.emit(geometry);
	}

	onCoordinatesChanges(
		location: google.maps.LatLng | google.maps.LatLngLiteral
	) {
		this.mapCoordEmitter.emit(location);
	}

	async createCarrier() {
		try {
			// GeoJSON use reversed order for coordinates from our implementation.
			// we use lat => lng but GeoJSON use lng => lat.
			const geoLocationInput = this.locationForm.getValue();
			geoLocationInput.loc.coordinates.reverse();

			this.loading = true;
			const carrierCreateObj = {
				...this.basicInfoForm.getValue(),
				geoLocation: geoLocationInput,
			};

			if (!carrierCreateObj.logo) {
				const letter = carrierCreateObj.firstName
					.charAt(0)
					.toUpperCase();
				carrierCreateObj.logo = getDummyImage(300, 300, letter);
			}

			const carrier = await this.carrierRouter.register({
				carrier: carrierCreateObj,
				password: this.basicInfoForm.getPassword(),
			});
			this.loading = false;
			this.toasterService.pop(
				'success',
				`Carrier ${carrier.firstName} was created`
			);
			this.activeModal.close(carrier);
		} catch (err) {
			this.loading = false;

			this.toasterService.pop(
				'error',
				`Error in creating carrier: "${err.message}"`
			);
			this.activeModal.dismiss('canceled');
		}
	}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	private _translate(key: string): string {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}
}
