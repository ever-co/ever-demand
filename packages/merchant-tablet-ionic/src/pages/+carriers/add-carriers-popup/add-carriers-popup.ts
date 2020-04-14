import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';

import { AddChoiceComponent } from './add-choice/add-choice';
import { AddNewCarrierComponent } from './add-new-carrier/add-new-carrier';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { Store } from '../../../services/store.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { CarriersCatalogComponent } from './carriers-catalog/carriers-catalog';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'page-add-carriers-popup',
	templateUrl: 'add-carriers-popup.html',
	styleUrls: ['./add-carriers-popup.scss'],
})
export class AddCarriersPopupPage implements OnInit, OnDestroy {
	@ViewChild('addNewCarrier', { static: false })
	addNewCarrierComponent: AddNewCarrierComponent;

	@ViewChild('carriersCatalog', { static: false })
	carriersCatalog: CarriersCatalogComponent;

	@ViewChild('addChoice', { static: true })
	addChoiceComponent: AddChoiceComponent;

	@ViewChild('wizzardFrom', { static: true })
	wizzardFrom: any;

	@ViewChild('wizzardFromStep1', { static: true })
	wizzardFromStep1: any;

	@ViewChild('wizardFormStep2', { static: true })
	wizardFormStep2: any;

	choiced: string;
	isDone: boolean;
	choicedNew: boolean = false;

	private choice$: any;
	private form$: any;
	private _ngDestroy$ = new Subject<void>();

	constructor(
		public modalController: ModalController,
		public carrierRouter: CarrierRouter,
		public warehouseRouter: WarehouseRouter,
		public store: Store,
		private readonly _translateService: TranslateService
	) {}

	ngOnInit() {
		this.wizzardFromStep1.showNext = false;

		this.choice$ = this.addChoiceComponent.choice.subscribe(async (res) => {
			this.choiced = res;
			this.wizzardFrom.next();
		});
	}

	buttonClickEvent(data) {
		const prevOrdNext: string = data;

		if (prevOrdNext === 'previous') {
			this.wizzardFrom.previous();
			this.choicedNew = false;
		}
	}

	completeCreateCarrier(data) {
		if (data === 'complete') {
			this.wizzardFrom.complete();
		}
	}

	get wizardStepsTitle() {
		let resultTitle = '';

		const step1 = () => {
			this._translateService
				.get('CARRIERS_VIEW.ADD_CARRIER.SELECT_HOW_TO_ADD')
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((title) => (resultTitle = title));

			return resultTitle;
		};

		const step2 = () => {
			this._translateService
				.get('CARRIERS_VIEW.ADD_CARRIER.ADD')
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((title) => (resultTitle = title));
			return resultTitle;
		};

		return {
			step1: step1(),
			step2: step2(),
		};
	}

	ngOnDestroy() {
		if (this.choice$) {
			this.choice$.unsubscribe();
		}

		if (this.form$) {
			this.form$.unsubscribe();
		}

		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	async onStep1Next(choiced) {
		if (choiced === 'new') {
			this.choicedNew = true;

			// const form = this.addNewCarrierComponent.form;
			// this.form$ = form.valueChanges.subscribe((res) => {
			// 	this.isDone = form.valid;
			// });
		} else if (choiced === 'existing') {
			this.choicedNew = false;
			this.form$ = this.carriersCatalog.hasChanges.subscribe((r) => {
				this.isDone = this.carriersCatalog.selecteCarriers.length > 0;
			});
		}
	}

	async add() {
		this.cancelModal();
		const warehouse: Warehouse = await this.warehouseRouter
			.get(this.store.warehouseId)
			.pipe(first())
			.toPromise();
		if (this.choiced === 'new') {
			const carrier = await this.carrierRouter.register({
				carrier: this.addNewCarrierComponent.getCarrierCreateObject(),
				password: this.addNewCarrierComponent.password.value,
			});

			warehouse.hasRestrictedCarriers = true;
			warehouse.usedCarriersIds.push(carrier.id);
		} else if (this.choiced === 'existing') {
			warehouse.hasRestrictedCarriers = true;
			warehouse.usedCarriersIds.push(
				...this.carriersCatalog.selecteCarriers.map((c) => c.id)
			);
		}

		this.warehouseRouter.save(warehouse);
	}

	cancelModal() {
		this.modalController.dismiss();
	}
}
