import {
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
	ElementRef,
	AfterViewInit
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/operators/map';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { ProductsCategoryService } from '../../../../@core/data/productsCategory.service';
import {
	IProductsCategoryCreateObject,
	IProductsCategoryName
} from '@modules/server.common/interfaces/IProductsCategory';
import { environment } from 'environments/environment';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as isUrl from 'is-url';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { NotifyService } from 'app/@core/services/notify/notify.service';

@Component({
	selector: 'ea-category-edit',
	templateUrl: './category-edit.component.html',
	styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnInit, AfterViewInit, OnDestroy {
	public currentCategory: {
		id: string;
		image: string;
		title: string;
		_nameLocaleValues: IProductsCategoryName[];
	};

	public userId: any;
	private _ngDestroy$ = new Subject<void>();

	@ViewChild('imagePreview')
	imagePreviewElement: ElementRef;

	uploader: FileUploader;

	protected readonly form: FormGroup = this._formBuilder.group({
		name: ['', Validators.required],
		image: [
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
		]
	});

	constructor(
		private readonly _activeModal: NgbActiveModal,
		private readonly _formBuilder: FormBuilder,
		private readonly _productsCategoryService: ProductsCategoryService,
		private readonly _langTranslateService: TranslateService,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly _notifyService: NotifyService
	) {}

	get image() {
		return this.form.get('image');
	}

	get name() {
		return this.form.get('name');
	}

	get isFormModelValid(): boolean {
		return this.form.valid;
	}

	get showImageMeta() {
		return this.image && this.image.value !== '';
	}

	ngOnInit() {
		this.name.setValue(this.currentCategory.title);
		this.image.setValue(this.currentCategory.image || '');

		this._setupUploadFileConfig();
	}

	ngAfterViewInit() {
		this._setupLogoUrlValidation();
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	cancel() {
		this._activeModal.dismiss('canceled');
	}

	deleteImg() {
		this.image.setValue('');
	}

	imageUrlChanged() {
		this.uploader.queue[0].upload();

		this.uploader.onSuccessItem = (
			item: any,
			response: string,
			status: number
		) => {
			const data = JSON.parse(response);
			this.image.setValue(data.url);
		};
	}

	async editCategory() {
		let usedLanguage = this._langTranslateService.currentLang;
		switch (usedLanguage) {
			case 'en':
				usedLanguage += '-US';
				break;
			case 'bg':
				usedLanguage += '-BG';
				break;
			case 'he':
				usedLanguage += '-IL';
				break;
			case 'ru':
				usedLanguage += '-RU';
				break;
			default:
				usedLanguage = 'en-US';
		}

		const categoryRaw = this._setupCategoryBeforeUpdate(usedLanguage);

		try {
			await this._productsCategoryService
				.update(this.currentCategory.id, categoryRaw)
				.pipe(first())
				.toPromise();

			const message = `Category ${this.localeTranslate(
				categoryRaw.name
			)} is edited`;
			this._notifyService.success(message);
			this.cancel();
		} catch (err) {
			const message = `Something went wrong!`;
			this._notifyService.error(message);
		}
	}

	protected localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	private _setupCategoryBeforeUpdate(
		usedLanguage: string
	): IProductsCategoryCreateObject {
		const newCategoryNames = this.currentCategory._nameLocaleValues.map(
			({ locale, value }) => {
				return locale === usedLanguage
					? { locale: usedLanguage, value: this.name.value }
					: { locale, value };
			}
		);
		if (!newCategoryNames.some((c) => c.locale === usedLanguage)) {
			newCategoryNames.push({
				locale: usedLanguage,
				value: this.name.value
			});
		}

		const categoryRaw: IProductsCategoryCreateObject = {
			name: newCategoryNames,
			image: this.image.value
		};

		return categoryRaw;
	}

	private _setupUploadFileConfig() {
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

	private _setupLogoUrlValidation() {
		this.imagePreviewElement.nativeElement.onload = () => {
			this.image.setErrors(null);
		};

		this.imagePreviewElement.nativeElement.onerror = () => {
			if (this.showImageMeta) {
				this.image.setErrors({ invalidUrl: true });
			}
		};
	}
}
