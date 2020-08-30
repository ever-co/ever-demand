import { Component, OnDestroy, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { LocalDataSource } from 'ng2-smart-table';
import { ProductsCategoryService } from '../../../@core/data/productsCategory.service';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import { CategoryCreateComponent } from '../../../@shared/product/categories/category-create/category-create.component';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoriesTableComponent } from '../../../@shared/product/categories/categories-table/categories-table.component';
import { NotifyService } from '@app/@core/services/notify/notify.service';

@Component({
	selector: 'ea-categories',
	templateUrl: './categories.component.html',
	styleUrls: ['/categories.component.scss'],
})
export class CategoriesComponent implements OnDestroy {
	@ViewChild('categoriesTable', { static: true })
	categoriesTable: CategoriesTableComponent;

	protected settingsSmartTable: object;
	protected sourceSmartTable = new LocalDataSource();

	private ngDestroy$ = new Subject<void>();
	public loading: boolean;

	constructor(
		private readonly _productsCategoryService: ProductsCategoryService,
		private readonly _modalService: NgbModal,
		private readonly _notifyService: NotifyService
	) {
		this._loadDataSmartTable();
	}

	protected get hasSelectedCategories(): boolean {
		return this.categoriesTable.hasSelectedCategories;
	}

	openWizardNewCategory() {
		this._modalService.open(CategoryCreateComponent, {
			size: 'lg',
			container: 'nb-layout',
			backdrop: 'static',
		});
	}

	async deleteSelectedRows() {
		const categories = this.categoriesTable.selectedCategories;
		const idsArray: any = [];
		for (const val of categories) {
			idsArray.push(val.id);
		}

		try {
			this.loading = true;
			await this._productsCategoryService
				.removeByIds(idsArray)
				.pipe()
				.toPromise();
			this.loading = false;
			const message = `Selected are removed!`;
			this._notifyService.success(message);
		} catch (error) {
			this.loading = false;
			const message = `Something went wrong!`;
			this._notifyService.error(message);
		}
	}

	private async _loadDataSmartTable() {
		let categories: ProductsCategory[] = [];
		this._productsCategoryService
			.getCategories()
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((c: ProductsCategory[]) => {
				categories = c;
				this.categoriesTable.loadDataSmartTable(categories);
			});
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
