import { Component, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterService } from 'angular2-toaster';
import { BasicInfoFormComponent } from '../forms/basic-info';
import { LocationFormComponent } from '../../forms/location';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ea-user-mutation',
	templateUrl: './user-mutation.component.html',
	styleUrls: ['/user-mutation.component.scss'],
})
export class UserMutationComponent {
	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('locationForm')
	locationForm: LocationFormComponent;

	mapTypeEmitter = new EventEmitter<string>();
	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();

	public BUTTON_DONE: string = 'BUTTON_DONE';
	public BUTTON_NEXT: string = 'BUTTON_NEXT';
	public BUTTON_PREV: string = 'BUTTON_PREV';

	readonly form: FormGroup = this.formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
		apartment: LocationFormComponent.buildApartmentForm(this.formBuilder),
		location: LocationFormComponent.buildForm(this.formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly apartment = this.form.get('apartment') as FormControl;
	readonly location = this.form.get('location') as FormControl;

	public loading: boolean;

	constructor(
		protected readonly userAuthRouter: UserAuthRouter,
		private readonly toasterService: ToasterService,
		private readonly activeModal: NgbActiveModal,
		private readonly formBuilder: FormBuilder,
		private readonly translateService: TranslateService
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

	onCoordinatesChanges(coords: number[]) {
		this.mapCoordEmitter.emit(coords);
	}

	onGeometrySend(geometry: any) {
		this.mapGeometryEmitter.emit(geometry);
	}

	emitMapType(mapType: string) {
		this.mapTypeEmitter.emit(mapType);
	}

	async create() {
		try {
			this.loading = true;

			// GeoJSON in MongoDB save coordinates lng-lat, but locationForm return lat-lng for that we reverse them
			const location = this.locationForm.getValue();
			location.loc.coordinates.reverse();

			const user = await this.userAuthRouter.register({
				user: {
					...this.basicInfoForm.getValue(),
					geoLocation: location,
					apartment: this.locationForm.getApartment(),
				},
			});
			this.loading = false;
			this.toasterService.pop(
				'success',
				`Customer with '${user.id}' was added`
			);
			this.activeModal.close(user);
		} catch (err) {
			this.loading = false;
			this.toasterService.pop(
				'error',
				`Error in creating customer: "${err.message}"`
			);
		}
	}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	private _translate(key: string): string {
		let translationResult = '';

		this.translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}
}
