import {
	Component,
	ViewChild,
	OnInit,
	OnDestroy,
	Output,
	EventEmitter,
} from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import QRCode from 'qrcode';
import { TranslateService } from '@ngx-translate/core';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { getDummyImage } from '@modules/server.common/utils';

@Component({
	selector: 'ea-merchants-setup-basic-info',
	templateUrl: './basic-info.component.html',
	styleUrls: ['./basic-info.component.scss'],
})
export class SetupMerchantBasicInfoComponent implements OnInit, OnDestroy {
	@ViewChild('basicInfoForm', { static: true })
	basicInfoForm: NgForm;

	@ViewChild('name')
	name: NgModel;

	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	private _ngDestroy$ = new Subject<void>();

	// TODO add translate
	uploaderPlaceholder: string = 'Photo (optional)';
	barcodetDataUrl: string;
	invalidUrl: boolean;
	basicInfoModel = {
		name: '',
		logo: '',
		barcodeData: '',
	};

	constructor(private translateService: TranslateService) {}

	ngOnInit(): void {
		this.getUploaderPlaceholderText();
	}

	get basicInfoCreateObj() {
		const model = { ...this.basicInfoModel };
		if (!model.logo && model.name) {
			const letter = model.name.charAt(0).toUpperCase();
			const pictureUrl = getDummyImage(300, 300, letter);
			model.logo = pictureUrl;
		}
		return model;
	}

	get formValid() {
		return (
			this.basicInfoForm.valid &&
			(this.basicInfoModel.logo === '' || !this.invalidUrl)
		);
	}

	deleteImg() {
		this.basicInfoModel.logo = '';
	}

	nameChange() {
		if (this.name.valid && this.basicInfoModel.barcodeData === '') {
			this.basicInfoModel.barcodeData = this.name.value;

			this.barcodeDataChange();
		}
	}

	async barcodeDataChange() {
		if (this.basicInfoModel.barcodeData) {
			this.barcodetDataUrl = await QRCode.toDataURL(
				this.basicInfoModel.barcodeData
			);
		} else {
			this.barcodetDataUrl = null;
		}
	}

	getUploaderPlaceholderText() {
		this.translateService
			.stream('FAKE_DATA.SETUP_MERCHANTS.BASIC_INFO.PHOTO_OPTIONAL')
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((text) => {
				this.uploaderPlaceholder = text;
			});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
