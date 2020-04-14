import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeviceService } from '../../@core/data/device.service';
import Device from '@modules/server.common/entities/Device';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeviceMutationComponent } from './device-mutation/device-mutation.component';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin, Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { NotifyService } from '../../@core/services/notify/notify.service';
import { ConfimationModalComponent } from '../../@shared/confirmation-modal/confirmation-modal.component';

@Component({
	selector: 'ea-device',
	styleUrls: ['./device.component.scss'],
	templateUrl: './device.component.html',
})
export class DeviceComponent implements OnDestroy, OnInit {
	private ngDestroy$ = new Subject<void>();

	public devices: Device[];
	private device$: any;
	public _selectedDevices: Device[] = [];

	public loading: boolean;

	static noInfoSign = '';

	protected sourceSmartTable: LocalDataSource = new LocalDataSource();
	protected settingsSmartTable: object;

	constructor(
		private readonly _deviceService: DeviceService,
		private readonly _modalService: NgbModal,
		private readonly _translateService: TranslateService,
		private readonly _notifyService: NotifyService
	) {
		this._loadSmartTableSettings();
		this._setupDataForSmartTable();
		this._listenForEntityLocaleTranslate();
		this._applyTranslationOnSmartTable();
	}

	// Maybe "updateDevice" this function is not in use?!
	updateDevice(device: Device) {
		const activeModal = this._modalService.open(DeviceMutationComponent, {
			size: 'lg',
			container: 'nb-layout',
			backdrop: 'static',
		});
		const modalComponent: DeviceMutationComponent =
			activeModal.componentInstance;
		modalComponent.device = device;
	}

	ngOnInit(): void {}

	edit(event) {
		const activeModal = this._modalService.open(DeviceMutationComponent, {
			size: 'lg',
			container: 'nb-layout',
			backdrop: 'static',
		});
		const modalComponent: DeviceMutationComponent =
			activeModal.componentInstance;
		modalComponent.device = event.data;
		modalComponent.loading = this.loading;
	}

	async deleteSelectedDevices() {
		const idsForDelete: string[] = this._selectedDevices.map((c) => c.id);

		try {
			this.loading = true;
			await this._deviceService
				.removeByIds(idsForDelete)
				.pipe(first())
				.toPromise();

			this.loading = false;
			const message = `${idsForDelete.length} devices was deleted`;
			this._notifyService.success(message);
		} catch (error) {
			this.loading = false;
			const message = `Something went wrong!`;
			this._notifyService.error(message);
		}
	}

	get hasSelectedDevices(): boolean {
		return this._selectedDevices.length > 0;
	}

	selectProductTmp(ev) {
		this._selectedDevices = ev.selected;
	}

	get selectedProducts() {
		return [...this._selectedDevices];
	}

	async deleteDevice(e) {
		const activeModal = this._modalService.open(ConfimationModalComponent, {
			size: 'sm',
			container: 'nb-layout',
			backdrop: 'static',
		});
		const modalComponent: ConfimationModalComponent =
			activeModal.componentInstance;

		await modalComponent.confirmEvent
			.pipe(takeUntil(modalComponent.ngDestroy$))
			.subscribe((dataEvent) => {
				const idsArray: any = [];
				idsArray.push(e.data.id);
				try {
					this.loading = true;
					this._deviceService
						.removeByIds(idsArray)
						.pipe()
						.toPromise();
					this.loading = false;
					const message = `${idsArray[0]} device was deleted`;
					this._notifyService.success(message);
				} catch (error) {
					this.loading = false;
					const message = `Something went wrong!`;
					this._notifyService.error(message);
				}
				modalComponent.cancel();
			});
	}

	private _listenForEntityLocaleTranslate() {
		this._translateService.onLangChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(() => {
				this._setupDataForSmartTable();
				this._loadSmartTableSettings();
			});
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this._loadSmartTableSettings();
		});
	}

	private _loadSmartTableSettings() {
		const columnTitlePrefix = 'CUSTOMERS_VIEW.DEVICE.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			getTranslate('ID'),
			getTranslate('LANGUAGE'),
			getTranslate('TYPE'),
			getTranslate('UUID')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(([id, language, type, uuid]) => {
				this.settingsSmartTable = {
					selectMode: 'multi',
					actions: {
						add: false,
						position: 'left',
					},
					edit: {
						editButtonContent: '<i class="ion-md-create"></i>',
					},
					delete: {
						deleteButtonContent: '<i class="ion-md-trash"></i>',
						confirmDelete: true,
					},
					mode: 'external',
					hideSubHeader: true,
					columns: {
						id: {
							title: id,
							filter: false,
						},
						language: {
							title: language,
							filter: false,
						},
						type: {
							title: type,
							filter: false,
						},
						uuid: {
							title: uuid,
							filter: false,
						},
					},
					pager: {
						display: true,
						perPage: 5,
					},
				};
			});
	}

	private _setupDataForSmartTable() {
		this._deviceService
			.getDevices()
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((data: Device[]) => {
				const devicesVm = data.map((c) => {
					return {
						id: c.id,
						language: c.language || DeviceComponent.noInfoSign,
						type: c.type || DeviceComponent.noInfoSign,
						uuid: c.uuid || DeviceComponent.noInfoSign,
					};
				});

				this.sourceSmartTable.load(devicesVm);
			});
	}

	ngOnDestroy(): void {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();

		if (this.device$) {
			this.device$.unsubscribe();
		}
	}
}
