import { Component, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { first } from 'rxjs/operators';
import { ProductsCategoryService } from '@app/@core/data/productsCategory.service';

@Component({
	selector: 'ea-category-create',
	templateUrl: './category-create.component.html',
	styleUrls: ['./category-create.component.scss'],
})
export class CategoryCreateComponent implements OnDestroy {
	productId: any;
	userId: any;
	loading: boolean;
	storybookVersion: boolean;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly activeModal: NgbActiveModal,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly _translateService: TranslateService,
		private readonly _notifyService: NotifyService,
		private readonly _productsCategoryService: ProductsCategoryService
	) {
		this._translateService.setDefaultLang('en');
		this._translateService.use('en');
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	async createCategory(createObject) {
		if (this.storybookVersion) {
			this._notifyService.success(
				'Category ' +
					this.localeTranslate(createObject.name) +
					' is added'
			);
			return true;
		}
		try {
			this.loading = true;
			await this._productsCategoryService
				.create(createObject)
				.pipe(first())
				.toPromise();
			this.loading = false;
			const message = `Category ${this.localeTranslate(
				createObject.name
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
}
