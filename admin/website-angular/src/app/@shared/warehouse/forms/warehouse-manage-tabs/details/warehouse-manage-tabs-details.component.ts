import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	AfterViewInit,
	OnInit
} from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	Validators
} from '@angular/forms';
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import { map, first } from 'rxjs/operators';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { Observable, concat } from 'rxjs';
import { FormHelpers } from '../../../../forms/helpers';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';
import * as isUrl from 'is-url';
import { TranslateService } from '@ngx-translate/core';

export type WarehouseManageTabsDetails = Pick<
	IWarehouseCreateObject,
	| 'name'
	| 'logo'
	| 'isActive'
	| 'hasRestrictedCarriers'
	| 'carriersIds'
	| 'isManufacturing'
	| 'isCarrierRequired'
>;

@Component({
	selector: 'ea-warehouse-manage-tabs-details',
	styleUrls: ['./warehouse-manage-tabs-details.component.scss'],
	templateUrl: './warehouse-manage-tabs-details.component.html'
})
export class WarehouseManageTabsDetailsComponent
	implements OnInit, AfterViewInit {
	@ViewChild('fileInput')
	fileInput: ElementRef;
	@ViewChild('logoPreview')
	logoPreviewElement: ElementRef;

	@Input()
	readonly form: FormGroup;

	uploaderPlaceholder: string;

	carriersOptions$: Observable<IMultiSelectOption[]> = concat(
		Observable.of([]),
		this._carrierRouter.getAllActive().pipe(
			map((carriers) =>
				carriers
					.filter((c) => c.isSharedCarrier)
					.map((c) => {
						return {
							id: c.id,
							name: `${c.firstName} ${c.lastName}`
						};
					})
			)
		)
	);

	constructor(
		private readonly _carrierRouter: CarrierRouter,
		private readonly _translateService: TranslateService
	) {}

	get name() {
		return this.form.get('name');
	}
	get logo() {
		return this.form.get('logo');
	}
	get isActive() {
		return this.form.get('isActive');
	}
	get hasRestrictedCarriers() {
		return this.form.get('hasRestrictedCarriers');
	}
	get carriersIds() {
		return this.form.get('carriersIds');
	}
	get showLogoMeta() {
		return this.logo && this.logo.value !== '';
	}

	get isManufacturing() {
		return this.form.get('isManufacturing');
	}

	get isCarrierRequired() {
		return this.form.get('isCarrierRequired');
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		// would be used in the parent component and injected into this.form
		return formBuilder.group({
			name: [
				'',
				[
					Validators.required,
					Validators.minLength(3),
					Validators.maxLength(255)
				]
			],
			logo: [
				'',
				[
					(control: AbstractControl) => {
						const imageUrl = control.value;

						if (!isUrl(imageUrl) && !_.isEmpty(imageUrl)) {
							return { invalidUrl: true };
						}

						return null;
					}
				]
			],
			isActive: [true, [Validators.required]],
			isManufacturing: [true, [Validators.required]],
			isCarrierRequired: [true, [Validators.required]],
			hasRestrictedCarriers: [false, [Validators.required]],
			carriersIds: [[]]
		});
	}

	ngOnInit(): void {
		this.getUploaderPlaceholderText();
	}

	ngAfterViewInit() {
		this._setupLogoUrlValidation();
	}

	getValue(): WarehouseManageTabsDetails {
		const basicInfo = this.form.getRawValue() as {
			name: string;
			logo: string;
			isActive: boolean;
			isManufacturing: boolean;
			isCarrierRequired: boolean;
			hasRestrictedCarriers: boolean;
			carriersIds: string[];
		};

		return {
			isActive: basicInfo.isActive,
			isManufacturing: basicInfo.isManufacturing,
			isCarrierRequired: basicInfo.isCarrierRequired,
			name: basicInfo.name,
			logo: basicInfo.logo,
			...(basicInfo.hasRestrictedCarriers
				? {
						hasRestrictedCarriers: basicInfo.hasRestrictedCarriers,
						carriersIds: basicInfo.carriersIds
				  }
				: {})
		};
	}

	setValue<T extends WarehouseManageTabsDetails>(basicInfo: T) {
		FormHelpers.deepMark(this.form, 'dirty');

		this.form.setValue(
			_.pick(basicInfo, [
				...Object.keys(this.getValue()),
				'hasRestrictedCarriers',
				'carriersIds'
			])
		);
	}

	deleteImg() {
		this.logo.setValue('');
	}

	private _setupLogoUrlValidation() {
		this.logoPreviewElement.nativeElement.onload = () => {
			this.logo.setErrors(null);
		};

		this.logoPreviewElement.nativeElement.onerror = () => {
			if (this.showLogoMeta) {
				this.logo.setErrors({ invalidUrl: true });
			}
		};
	}

	private async getUploaderPlaceholderText() {
		const res = await this._translateService
			.get(['WAREHOUSE_VIEW.MUTATION.PHOTO', 'OPTIONAL'])
			.pipe(first())
			.toPromise();

		this.uploaderPlaceholder = `${res['WAREHOUSE_VIEW.MUTATION.PHOTO']} (${
			res['OPTIONAL']
		})`;
	}
}
