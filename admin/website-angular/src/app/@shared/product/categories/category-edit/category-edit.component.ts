import { Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/operators/map';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { ProductsCategoryService } from '../../../../@core/data/productsCategory.service';
import {
	IProductsCategoryCreateObject,
	IProductsCategoryName
} from '@modules/server.common/interfaces/IProductsCategory';
import { TranslateService } from '@ngx-translate/core';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { NotifyService } from 'app/@core/services/notify/notify.service';

@Component({
	selector: 'ea-category-edit',
	templateUrl: './category-edit.component.html',
	styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnDestroy {
	currentCategory: {
		id: string;
		image: string;
		title: string;
		_nameLocaleValues: IProductsCategoryName[];
	};

	userId: any;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _activeModal: NgbActiveModal,
		private readonly _productsCategoryService: ProductsCategoryService,
		private readonly _langTranslateService: TranslateService,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly _notifyService: NotifyService
	) {}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	cancel() {
		this._activeModal.dismiss('canceled');
	}

	async editCategory(categoryObject) {
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

		const categoryRaw = this._setupCategoryBeforeUpdate(
			categoryObject,
			usedLanguage
		);

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

	localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	private _setupCategoryBeforeUpdate(
		categoryObject,
		usedLanguage: string
	): IProductsCategoryCreateObject {
		const newCategoryNames = this.currentCategory._nameLocaleValues.map(
			({ locale, value }) => {
				return locale === usedLanguage
					? {
							locale: usedLanguage,
							value: categoryObject.name
					  }
					: { locale, value };
			}
		);
		if (!newCategoryNames.some((c) => c.locale === usedLanguage)) {
			newCategoryNames.push({
				locale: usedLanguage,
				value: categoryObject.name
			});
		}

		const categoryRaw: IProductsCategoryCreateObject = {
			name: newCategoryNames,
			image: categoryObject.image
		};

		return categoryRaw;
	}
}
