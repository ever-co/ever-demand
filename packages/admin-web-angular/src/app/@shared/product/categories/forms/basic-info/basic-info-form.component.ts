import {
	Component,
	ViewChild,
	ElementRef,
	OnInit,
	AfterViewInit,
	Input,
	OnDestroy,
} from '@angular/core';
import {
	FormGroup,
	Validators,
	AbstractControl,
	FormBuilder,
} from '@angular/forms';
import isUrl from 'is-url';
import _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { first, takeUntil } from 'rxjs/operators';
import { IProductsCategoryCreateObject } from '@modules/server.common/interfaces/IProductsCategory';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { Subject } from 'rxjs';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	selector: 'ea-product-category-basic-info-form',
	templateUrl: 'basic-info-form.component.html',
	styleUrls: ['basic-info-form.component.scss'],
})
export class BasicInfoFormComponent
	implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('imagePreview', { static: true })
	imagePreviewElement: ElementRef;

	@Input()
	category: {
		title: string;
		image: string;
		_nameLocaleValues: ILocaleMember[];
	};

	categoryRaw: IProductsCategoryCreateObject;

	languageCode: string;

	private _ngDestroy$ = new Subject<void>();

	uploaderPlaceholder: string;

	readonly form: FormGroup = this.fb.group({
		name: [''],
		image: [
			'',
			[
				(control: AbstractControl) => {
					const imageUrl = control.value;

					if (!isUrl(imageUrl) && !_.isEmpty(imageUrl)) {
						return { invalidUrl: true };
					}

					return null;
				},
			],
		],
		locale: ['', [Validators.required]],
	});

	constructor(
		private readonly fb: FormBuilder,
		private readonly _langTranslateService: TranslateService,
		private readonly productLocalesService: ProductLocalesService
	) {}

	get image() {
		return this.form.get('image');
	}

	get name() {
		return this.form.get('name');
	}

	get locale() {
		return this.form.get('locale');
	}

	get isFormModelValid(): boolean {
		return this.form.valid;
	}

	get showImageMeta() {
		return this.image && this.image.value !== '';
	}

	get usedLanguage() {
		const usedLanguage = this._langTranslateService.currentLang;
		switch (usedLanguage) {
			case 'en-US':
				return 'en-US';

			case 'bg-BG':
				return 'bg-BG';

			case 'he-IL':
				return 'he-IL';

			case 'ru-RU':
				return 'ru-RU';

			case 'es-ES':
				return 'es-ES';

			default:
				return 'en-US';
		}
	}

	get createObject() {
		this._saveCurrentFormValue();
		return this.categoryRaw;
	}

	getEditObject() {
		this._saveCurrentFormValue();
		return this.categoryRaw;
	}

	ngOnInit() {
		if (this.category) {
			this.name.setValue(this.category.title);
			this.image.setValue(this.category.image);
		} else {
			this.category = {
				title: '',
				image: '',
				_nameLocaleValues: [],
			};
		}

		this.locale.setValue(this.usedLanguage);

		this._updateCategoryTranslations();

		this.languageCode = this.locale.value;

		this.locale.valueChanges
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((newLangCode) => {
				this._saveCurrentFormValue();

				this.languageCode = newLangCode;
				this._updateCategoryTranslations();
			});

		this.getUploaderPlaceholderText();
	}

	ngOnDestroy(): void {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	deleteImg() {
		this.image.setValue('');
	}

	ngAfterViewInit() {
		this._setupLogoUrlValidation();
	}

	private async getUploaderPlaceholderText() {
		this.uploaderPlaceholder = await this._langTranslateService
			.get('CATEGORY_VIEW.CREATE.PHOTO_OPTIONAL')
			.pipe(first())
			.toPromise();
	}

	private async _updateCategoryTranslations() {
		const usedLanguage = this.locale.value;

		if (
			!this.category._nameLocaleValues.some(
				(c) => c.locale === usedLanguage
			)
		) {
			this.category._nameLocaleValues.push({
				locale: usedLanguage,
				value: '',
			});
		}

		this._setFormValue(usedLanguage);
	}

	private _saveCurrentFormValue() {
		this.category._nameLocaleValues = this.category._nameLocaleValues.map(
			({ locale, value }) => {
				const res =
					locale === this.languageCode
						? {
								locale: locale,
								value: this.name.value || '',
						  }
						: { locale, value };

				return res;
			}
		);

		this.categoryRaw = {
			name: this.category._nameLocaleValues,
			image: this.image.value,
		};
	}

	private _setFormValue(usedLanguage: string) {
		this.form.patchValue({
			name: this.productLocalesService.getTranslate(
				this.category._nameLocaleValues,
				usedLanguage
			),
		});
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
