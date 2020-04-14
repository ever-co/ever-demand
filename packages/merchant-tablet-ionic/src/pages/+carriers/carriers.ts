import { Component, OnDestroy, OnInit } from '@angular/core';
import Carrier from '@modules/server.common/entities/Carrier';
import { takeUntil, first } from 'rxjs/operators';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable, Subject, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { PhoneComponent } from '../../components/carriers-table/phone';
import { AddressesComponent } from '../../components/carriers-table/addresses';
import { StatusComponent } from '../../components/carriers-table/status';
import { DeliveriesComponent } from '../../components/carriers-table/deliveries';
import { ImageComponent } from '../../components/carriers-table/image';
import { WarehouseCarriersRouter } from '@modules/client.common.angular2/routers/warehouse-carriers-router.service';
import { Store } from '../../../src/services/store.service';
import { ModalController } from '@ionic/angular';
import { AddCarriersPopupPage } from './add-carriers-popup/add-carriers-popup';
import { CarrierEditPopupPage } from './carrier-edit-popup/carrier-edit-popup';
import { CarrierTrackPopup } from './carrier-track-popup/carrier-track-popup';
import { Router } from '@angular/router';
import { ConfirmDeletePopupPage } from 'components/confirm-delete-popup/confirm-delete-popup';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';

@Component({
	selector: 'page-carriers',
	templateUrl: 'carriers.html',
	styleUrls: ['./carriers.scss'],
})
export class CarriersPage implements OnInit, OnDestroy {
	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();
	carriers: Carrier[];
	showNoDeliveryIcon: boolean;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly router: Router,
		public modalCtrl: ModalController,
		private readonly warehouseCarriersRouter: WarehouseCarriersRouter,
		private readonly _translateService: TranslateService,
		private readonly store: Store,
		private warehouseRouter: WarehouseRouter
	) {}

	get deviceId() {
		return localStorage.getItem('_deviceId');
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	ngOnInit(): void {
		this._loadCarriers();
		this._loadSettingsSmartTable();
	}

	async openAddCarriers() {
		const addCarriersPopupModal = await this.modalCtrl.create({
			component: AddCarriersPopupPage,

			cssClass: 'add-carriers-popup',
		});

		await addCarriersPopupModal.present();
	}

	async trackCarrier(e) {
		const modal = await this.modalCtrl.create({
			component: CarrierTrackPopup,
			componentProps: { carrier: e.data.carrier },
			cssClass: 'carrier-track-wrapper',
		});

		await modal.present();
	}

	async deleteCarrier(e) {
		const modal = await this.modalCtrl.create({
			component: ConfirmDeletePopupPage,
			componentProps: { data: e.data },
			cssClass: 'confirm-delete-wrapper',
		});

		await modal.present();

		const res = await modal.onDidDismiss();
		if (res.data) {
			const carrierId = e.data.carrier.id;

			const id = this.warehouseId;

			const merchant = await this.warehouseRouter
				.get(id)
				.pipe(first())
				.toPromise();

			merchant.usedCarriersIds = merchant.usedCarriersIds.filter(
				(x) => x !== carrierId
			);

			await this.warehouseRouter.save(merchant);
		}
	}

	async editCarrier(e) {
		const modal = await this.modalCtrl.create({
			component: CarrierEditPopupPage,
			componentProps: { carrier: e.data.carrier },
			cssClass: 'carrier-edit-wrapper',
		});

		await modal.present();
	}

	private async _loadCarriers() {
		const loadData = (carriers) => {
			const carriersVM = carriers.map((c: Carrier) => {
				return {
					image: c.logo,
					name: c.firstName + ' ' + c.lastName,
					phone: c.phone,
					addresses: c.geoLocation.city,
					status: c.status === 0 ? 'working' : 'not working',
					carrier: c,
				};
			});

			this.sourceSmartTable.load(carriersVM);
		};

		this.warehouseCarriersRouter
			.get(this.warehouseId)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((carriers) => {
				this.carriers = carriers;

				loadData(this.carriers);

				this.carriers.length === 0
					? (this.showNoDeliveryIcon = true)
					: (this.showNoDeliveryIcon = false);
			});
	}

	goToTrackPage() {
		this.router.navigateByUrl('/track');
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CARRIERS_VIEW.';
		const getTranslate = (name: string): Observable<string> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			getTranslate('IMAGE'),
			getTranslate('NAME'),
			getTranslate('PHONE_NUMBER'),
			getTranslate('ADDRESSES'),
			getTranslate('STATUS'),
			getTranslate('DELIVERIES')
		)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(
				([image, name, phone, addresses, status, deliveries]) => {
					this.settingsSmartTable = {
						mode: 'external',
						edit: {
							editButtonContent: '<i class="fa fa-edit"></i>',
							confirmEdit: true,
						},
						delete: {
							deleteButtonContent: '<i class="fa fa-trash"></i>',
							confirmDelete: true,
						},
						actions: {
							custom: [
								{
									name: 'track',
									title: '<i class="fa fa-map-marker"></i>',
								},
							],
						},
						columns: {
							image: {
								title: image,
								type: 'custom',
								renderComponent: ImageComponent,
								filter: false,
							},
							name: { title: name },
							phone: {
								title: phone,
								type: 'custom',
								renderComponent: PhoneComponent,
							},
							addresses: {
								title: addresses,
								type: 'custom',
								renderComponent: AddressesComponent,
							},
							status: {
								title: status,
								class: 'text-center',
								type: 'custom',
								renderComponent: StatusComponent,
							},
							deliveries: {
								title: deliveries,
								class: 'text-center',
								filter: false,
								type: 'custom',
								renderComponent: DeliveriesComponent,
							},
						},
						pager: {
							display: true,
							perPage: 14,
						},
					};
				}
			);
	}
}
