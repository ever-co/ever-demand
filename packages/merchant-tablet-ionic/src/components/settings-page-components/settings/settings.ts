import {
	Component,
	Input,
	AfterViewInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import Warehouse from '@modules/server.common/entities/Warehouse';
import OrderBarcodeTypes, {
	orderBarcodeTypesToString,
} from '@modules/server.common/enums/OrderBarcodeTypes';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import QRCode from 'qrcode';
import { BarcodeScanService } from '../../../services/native/barcode-scan.service';
import { AlertController } from '@ionic/angular/alert-controller';
import { Store } from '../../../services/store.service';

@Component({
	standalone: false,
	selector: 'merchant-settings',
	templateUrl: 'settings.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['settings.scss'],
})
export class SettingsComponent implements AfterViewInit {
	@Input()
	currWarehouse: Warehouse;

	showPayments = false;

	orderBarcodeTypes: OrderBarcodeTypes[] = [
		OrderBarcodeTypes.QR,
		OrderBarcodeTypes.CODE128,
		OrderBarcodeTypes.CODE39,
		OrderBarcodeTypes.pharmacode,
	];

	selectedOrderBarcodeType: OrderBarcodeTypes;
	barcodetDataUrl: string;
	hasScanCode: boolean;

	private merchantBeforeUpdate: Warehouse;

	constructor(
		private warehouseRouter: WarehouseRouter,
		public alertController: AlertController,
		private barcodeScanner: BarcodeScanService,
		private store: Store,
	) {}

	ngAfterViewInit(): void {
		if (this.currWarehouse) {
			this.merchantBeforeUpdate = new Warehouse(this.currWarehouse);
		}

		this.generateQRCode();
	}

	getorderBarcodeTypesToString(status: OrderBarcodeTypes) {
		return orderBarcodeTypesToString(status);
	}

	hasChanges() {
		return !Array.from(arguments).includes(true) && !this.hasScanCode;
	}

	async saveChanges() {
		try {
			await this.warehouseRouter.save(
				this.currWarehouse,
				this.store.token,
			);
			const alert = await this.alertController.create({
				cssClass: 'success-info',
				message: 'Successfully saved changes',
				buttons: ['OK'],
			});

			await alert.present();
		} catch (error) {
			const alert = await this.alertController.create({
				cssClass: 'error-info',
				message: error.message,
				buttons: ['OK'],
			});

			this.currWarehouse = this.merchantBeforeUpdate;
			await alert.present();
		}
	}

	async scan() {
		try {
			const barcodeData = await this.barcodeScanner.scan();
			this.currWarehouse.barcodeData = barcodeData.text;
			this.hasScanCode = true;
		} catch (error) {
			console.warn(error);
		}
	}

	async barcodeDataChange(e) {
		if (e.value) {
			await this.generateQRCode();
		} else {
			this.barcodetDataUrl = null;
		}
	}

	private async generateQRCode() {
		if (this.currWarehouse) {
			this.barcodetDataUrl = await QRCode.toDataURL(
				this.currWarehouse.barcodeData,
			);
		}

		this.showPayments = true;
	}
}
