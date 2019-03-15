import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	AfterViewInit
} from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	Validators
} from '@angular/forms';
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import { map } from 'rxjs/operators';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { Observable, concat } from 'rxjs';
import { FormHelpers } from '../../../../forms/helpers';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { environment } from 'environments/environment';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';
import * as isUrl from 'is-url';

export type WarehouseManageTabsDetails = Pick<
	IWarehouseCreateObject,
	| 'name'
	| 'logo'
	| 'isActive'
	| 'hasRestrictedCarriers'
	| 'usedCarriersIds'
	| 'isManufacturing'
	| 'isCarrierRequired'
>;

@Component({
	selector: 'ea-warehouse-manage-tabs-details',
	styleUrls: ['./warehouse-manage-tabs-details.component.scss'],
	templateUrl: './warehouse-manage-tabs-details.component.html'
})
export class WarehouseManageTabsDetailsComponent implements AfterViewInit {
	@ViewChild('fileInput')
	fileInput: ElementRef;

	@ViewChild('logoPreview')
	logoPreviewElement: ElementRef;

	public uploader: FileUploader;

	@Input()
	readonly form: FormGroup;

	carriersOptions$: Observable<IMultiSelectOption[]> = concat(
		Observable.of([]),
		this._carrierRouter.getAllActive().pipe(
			map((carriers) =>
				carriers.map((c) => {
					return {
						id: c.id,
						name: `${c.firstName} ${c.lastName}`
					};
				})
			)
		)
	);

	constructor(private readonly _carrierRouter: CarrierRouter) {
		this._uploaderConfig();
	}

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
	get usedCarriersIds() {
		return this.form.get('usedCarriersIds');
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
			usedCarriersIds: [[]]
		});
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
			usedCarriersIds: string[];
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
						usedCarriersIds: basicInfo.usedCarriersIds
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
				'usedCarriersIds'
			])
		);
	}

	imageUrlChanged() {
		this.uploader.queue[0].upload();

		this.uploader.onSuccessItem = (
			item: any,
			response: string,
			status: number
		) => {
			const data = JSON.parse(response);
			this.logo.setValue(data.url);
		};
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

	private _uploaderConfig() {
		const uploaderOptions: FileUploaderOptions = {
			url: environment.API_FILE_UPLOAD_URL,

			isHTML5: true,
			removeAfterUpload: true,
			headers: [
				{
					name: 'X-Requested-With',
					value: 'XMLHttpRequest'
				}
			]
		};
		this.uploader = new FileUploader(uploaderOptions);

		this.uploader.onBuildItemForm = (
			fileItem: any,
			form: FormData
		): any => {
			form.append('upload_preset', 'everbie-products-images');
			let tags = 'myphotoalbum';
			if (this.name.value) {
				form.append('context', `photo=${this.name.value}`);
				tags = `myphotoalbum,${this.name.value}`;
			}

			form.append('folder', 'angular_sample');
			form.append('tags', tags);
			form.append('file', fileItem);

			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}
}
