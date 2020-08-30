import { Component, ViewChild, EventEmitter } from '@angular/core';
import { LocationFormComponent } from '@app/@shared/forms/location';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ToasterService } from 'angular2-toaster';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IInviteRequestCreateObject } from '@modules/server.common/interfaces/IInviteRequest';
import { InviteRequestRouter } from '@modules/client.common.angular2/routers/invite-request-router.service';

@Component({
	selector: 'ea-invite-request-modal',
	templateUrl: './invite-request-modal.component.html',
	styleUrls: ['/invite-request-modal.component.scss'],
})
export class InviteRequestModalComponent {
	@ViewChild('locationForm', { static: true })
	locationForm: LocationFormComponent;

	mapTypeEmitter = new EventEmitter<string>();
	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();

	readonly form: FormGroup = this.formBuilder.group({
		location: LocationFormComponent.buildForm(this.formBuilder),
		apartment: LocationFormComponent.buildApartmentForm(this.formBuilder),
	});

	readonly location = this.form.get('location') as FormControl;
	readonly apartment = this.form.get('apartment') as FormControl;

	constructor(
		private readonly toasterService: ToasterService,
		private readonly activeModal: NgbActiveModal,
		private readonly formBuilder: FormBuilder,
		private readonly inviteRequestRouter: InviteRequestRouter
	) {}

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
			const inciteRequest = await this.inviteRequestRouter.create(
				this.getInviteRequestCreateObj()
			);
			this.toasterService.pop(
				'success',
				`Successful create invite request`
			);
			this.activeModal.close(inciteRequest);
		} catch (err) {
			this.toasterService.pop(
				'error',
				`Error in creating invite request: "${err.message}"`
			);
		}
	}

	closeModal() {
		this.activeModal.close();
	}

	private getInviteRequestCreateObj(): IInviteRequestCreateObject {
		// GeoJSON use reversed order for coordinates from our implementation.
		// we use lat => lng but GeoJSON use lng => lat.
		const geoLocationInput = this.locationForm.getValue();
		geoLocationInput.loc.coordinates.reverse();
		return {
			geoLocation: geoLocationInput,
			apartment: this.locationForm.getApartment() || ' ',
		};
	}
}
