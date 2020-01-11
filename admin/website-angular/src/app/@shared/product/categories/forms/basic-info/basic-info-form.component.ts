import {
	Component,
	ViewChild,
	ElementRef,
	OnInit,
	AfterViewInit,
	Input
} from '@angular/core';
import {
	FormGroup,
	Validators,
	AbstractControl,
	FormBuilder
} from '@angular/forms';
import * as isUrl from 'is-url';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { IProductsCategoryCreateObject } from '@modules/server.common/interfaces/IProductsCategory';

@Component({
	selector: 'ea-product-category-basic-info-form',
	templateUrl: 'basic-info-form.component.html',
	styleUrls: ['basic-info-form.component.scss']
})
export class BasicInfoFormComponent implements OnInit, AfterViewInit {
	@ViewChild('imagePreview', { static: true })
	imagePreviewElement: ElementRef;

	@Input()
	category: { title: string; image: string };

	uploaderPlaceholder: string;

	readonly form: FormGroup = this.fb.group({
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
		private readonly fb: FormBuilder,
		private readonly _langTranslateService: TranslateService
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

	get usedLanguage() {
		let usedLanguage = this._langTranslateService.currentLang;
		switch (usedLanguage) {
			case 'en':
				return (usedLanguage += '-US');

			case 'bg':
				return (usedLanguage += '-BG');

			case 'he':
				return (usedLanguage += '-IL');

			case 'ru':
				return (usedLanguage += '-RU');

			default:
				return 'en-US';
		}
	}

	get createObject() {
		const usedLanguage = this.usedLanguage;

		const categoryObject: IProductsCategoryCreateObject = {
			name: [{ locale: usedLanguage, value: this.name.value }]
		};
		if (this.showImageMeta) {
			categoryObject.image = this.image.value;
		}

		return categoryObject;
	}

	getEditObject(currentCategory) {
		const usedLanguage = this.usedLanguage;
		const newCategoryNames = currentCategory._nameLocaleValues.map(
			({ locale, value }) => {
				return locale === usedLanguage
					? {
							locale: usedLanguage,
							value: this.name.value
					  }
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

	ngOnInit() {
		if (this.category) {
			this.name.setValue(this.category.title);
			this.image.setValue(this.category.image);
		}

		this.getUploaderPlaceholderText();
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
