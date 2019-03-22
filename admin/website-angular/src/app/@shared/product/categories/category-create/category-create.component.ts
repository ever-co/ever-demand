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
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { ProductsCategoryService } from '../../../../@core/data/productsCategory.service';
import { IProductsCategoryCreateObject } from '@modules/server.common/interfaces/IProductsCategory';

import * as _ from 'lodash';
import * as isUrl from 'is-url';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { NotifyService } from 'app/@core/services/notify/notify.service';

@Component({
	selector: 'ea-category-create',
	templateUrl: './category-create.component.html',
	styleUrls: ['./category-create.component.scss']
})
export class CategoryCreateComponent
	implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('imagePreview')
	imagePreviewElement: ElementRef;

	productId: any;
	userId: any;
	loading: boolean;
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

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly activeModal: NgbActiveModal,
		private readonly fb: FormBuilder,
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
		this.getUploaderPlaceholderText();
	}

	ngAfterViewInit() {
		this._setupLogoUrlValidation();
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	deleteImg() {
		this.image.setValue('');
	}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	async createCategory() {
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

		const categoryRaw: IProductsCategoryCreateObject = {
			name: [{ locale: usedLanguage, value: this.name.value }]
		};

		if (this.showImageMeta) {
			categoryRaw.image = this.image.value;
		}

		try {
			this.loading = true;
			await this._productsCategoryService
				.create(categoryRaw)
				.pipe(first())
				.toPromise();
			this.loading = false;
			const message = `Category ${this.localeTranslate(
				categoryRaw.name
			)} is added!`;
			this._notifyService.success(message);

			this.cancel();
		} catch (err) {
			this.loading = false;
			const message = `Something went wrong!`;
			this._notifyService.error(message);
		}
	}

	localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
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

	private async getUploaderPlaceholderText() {
		this.uploaderPlaceholder = await this._langTranslateService
			.get('CATEGORY_VIEW.CREATE.PHOTO_OPTIONAL')
			.pipe(first())
			.toPromise();
	}
}
