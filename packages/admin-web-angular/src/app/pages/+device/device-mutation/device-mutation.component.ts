import { Component, OnDestroy, OnInit } from '@angular/core';
import Device from '@modules/server.common/entities/Device';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from '@angular/forms';
import { DeviceService } from '../../../@core/data/device.service';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NotifyService } from '../../../@core/services/notify/notify.service';

@Component({
	selector: 'ea-device-mutation',
	templateUrl: './device-mutation.component.html',
})
export class DeviceMutationComponent implements OnDestroy, OnInit {
	private ngDestroy$ = new Subject<void>();
	public device: Device;
	public loading: boolean;

	readonly form = this.fb.group({
		id: ['', Validators.required],
		language: ['', Validators.required],
		type: ['', Validators.required],
		uuid: ['', Validators.required],
	});

	public id = this.form.get('id');
	public language = this.form.get('language');
	public type = this.form.get('type');
	public uuid = this.form.get('uuid');

	constructor(
		private readonly activeModal: NgbActiveModal,
		private readonly fb: FormBuilder,
		private readonly deviceService: DeviceService,
		private readonly _notifyService: NotifyService
	) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	async update() {
		try {
			this.loading = true;
			const dev = await this.deviceService
				.update(this.id.value, {
					language: this.language.value,
					type: this.type.value,
					uuid: this.uuid.value,
				})
				.pipe(first())
				.toPromise();
			this.loading = false;
			const message = `Device was updated! BLQKS`;
			this._notifyService.success(message);
		} catch (error) {
			let message = `Something went wrong`;
			if (error.message === 'Validation error') {
				message = error.message;
			}
			this.loading = false;
			this._notifyService.error(message);
		}

		this.cancel();
	}

	ngOnInit(): void {
		this.id.setValue(this.device.id);
		this.language.setValue(this.device.language);
		this.type.setValue(this.device.type);
		this.uuid.setValue(this.device.uuid);
	}

	ngOnDestroy(): void {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
