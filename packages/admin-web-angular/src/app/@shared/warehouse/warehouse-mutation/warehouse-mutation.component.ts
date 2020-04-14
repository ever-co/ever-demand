import {
	Component,
	ViewChild,
	EventEmitter,
	AfterViewInit,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { ToasterService } from 'angular2-toaster';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BasicInfoFormComponent, ContactInfoFormComponent } from '../forms';
import { LocationFormComponent } from '../../forms/location';
import { TranslateService } from '@ngx-translate/core';
import { PaymentsSettingsFormComponent } from '../forms/payments-settings/payments-settings-form.component';

@Component({
	selector: 'ea-warehouse-mutation',
	templateUrl: './warehouse-mutation.component.html',
	styleUrls: ['./warehouse-mutation.component.scss'],
})
export class WarehouseMutationComponent implements AfterViewInit {
	loading: boolean;

	public BUTTON_DONE: string = 'BUTTON_DONE';
	public BUTTON_NEXT: string = 'BUTTON_NEXT';
	public BUTTON_PREV: string = 'BUTTON_PREV';

	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('contactInfoForm', { static: true })
	contactInfoForm: ContactInfoFormComponent;

	@ViewChild('locationForm')
	locationForm: LocationFormComponent;

	@ViewChild('paymentsSettingsForm')
	paymentsSettingsForm: PaymentsSettingsFormComponent;

	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();

	readonly form: FormGroup = this.formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
		password: BasicInfoFormComponent.buildPasswordForm(this.formBuilder),
		contactInfo: ContactInfoFormComponent.buildForm(this.formBuilder),
		location: LocationFormComponent.buildForm(this.formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly contactInfo = this.form.get('contactInfo') as FormControl;
	readonly location = this.form.get('location') as FormControl;
	readonly password = this.form.get('password') as FormControl;

	constructor(
		private readonly activeModal: NgbActiveModal,
		private readonly formBuilder: FormBuilder,
		private readonly toasterService: ToasterService,
		private readonly warehouseRouter: WarehouseRouter,
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

	get isValidContactInfo() {
		return this.contactInfoForm.validForm !== undefined
			? this.contactInfoForm.validForm
			: true;
	}

	ngAfterViewInit() {
		// This hack is need because the styles of 'ng-bootstrap' modal and google autocomplete api
		// collide and autocomplete field just doesn't show without larger z-index.
		setTimeout(() => {
			const elementRef = document.querySelector(
				'body > div.pac-container.pac-logo'
			);

			if (elementRef) {
				elementRef['style']['zIndex'] = 10000;
			}
		}, 2000);

		if (this.locationForm) {
			this.locationForm.setDefaultCoords();
		}
	}

	onCoordinatesChanges(coords: number[]) {
		this.mapCoordEmitter.emit(coords);
	}

	onGeometrySend(geometry: any) {
		this.mapGeometryEmitter.emit(geometry);
	}

	async createWarehouse() {
		try {
			// GeoJSON use reversed order for coordinates from our implementation.
			// we use lat => lng but GeoJSON use lng => lat.
			const geoLocationInput = this.locationForm.getValue();
			geoLocationInput.loc.coordinates.reverse();

			this.loading = true;
			const w = await this.warehouseRouter.register({
				warehouse: {
					...this.basicInfoForm.getValue(),
					...this.contactInfoForm.getValue(),
					geoLocation: geoLocationInput,
					isPaymentEnabled: this.paymentsSettingsForm
						.isPaymentEnabled,
					paymentGateways: this.paymentsSettingsForm.paymentsGateways,
				},
				password: this.basicInfoForm.getPassword(),
			});
			this.loading = false;
			this.toasterService.pop(
				'success',
				`Warehouse ${w.name} was created!`
			);

			this.activeModal.close();
		} catch (err) {
			this.loading = false;
			this.toasterService.pop(
				'error',
				`Error in creating warehouse: "${err.message}"`
			);
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
