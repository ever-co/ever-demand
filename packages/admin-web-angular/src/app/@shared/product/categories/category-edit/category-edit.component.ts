import { Component, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/operators/map';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { ProductsCategoryService } from '../../../../@core/data/productsCategory.service';
import { IProductsCategoryName } from '@modules/server.common/interfaces/IProductsCategory';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { NotifyService } from '@app/@core/services/notify/notify.service';

@Component({
	selector: 'ea-category-edit',
	templateUrl: './category-edit.component.html',
	styleUrls: ['./category-edit.component.scss'],
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

	async editCategory(categoryRaw) {
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
}
