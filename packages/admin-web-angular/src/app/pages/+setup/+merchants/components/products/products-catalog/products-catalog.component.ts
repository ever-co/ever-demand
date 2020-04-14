import { Component, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { ProductsTableComponent } from '@app/@shared/product/forms/products-table';
import { first, takeUntil } from 'rxjs/operators';
import { ProductsService } from '@app/@core/data/products.service';
import { Subject } from 'rxjs';

@Component({
	selector: 'ea-merchants-setup-products-catalog',
	templateUrl: './products-catalog.component.html',
})
export class SetupMerchantProductsCatalogComponent
	implements OnInit, OnDestroy {
	@ViewChild('productsTable', { static: true })
	productsTable: ProductsTableComponent;

	@Input()
	existedProductsIds: string[];
	perPage = 3;

	private ngDestroy$ = new Subject<void>();

	constructor(private readonly productsService: ProductsService) {}

	ngOnInit(): void {
		this.loadData();
		this.smartTablePageChange();
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	private async loadData(page = 1) {
		let products = await this.productsService
			.getProducts(
				{
					skip: this.perPage * (page - 1),
					limit: this.perPage,
				},
				this.existedProductsIds
			)
			.pipe(first())
			.toPromise();

		const dataCount = await this.getDataCount(this.existedProductsIds);

		this.productsTable.loadDataSmartTable(products, dataCount, page);
	}

	private async smartTablePageChange() {
		if (this.productsTable) {
			this.productsTable.pagesChanges$
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((page) => {
					this.loadData(page);
				});
		}
	}

	private async getDataCount(existedProductsIds: string[]) {
		return this.productsService.getCountOfProducts(existedProductsIds);
	}
}
