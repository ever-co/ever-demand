import { Component, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { takeUntil, first } from 'rxjs/operators';
import { LocalDataSource } from 'ng2-smart-table';
import { ProductsService } from '../../@core/data/products.service';
import Product from '@modules/server.common/entities/Product';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductCreateComponent } from '../../@shared/product/product-create';
import { ProductsTableComponent } from '../../@shared/product/forms/products-table';
import { ProductsCategoryService } from '../../@core/data/productsCategory.service';
import { NotifyService } from '@app/@core/services/notify/notify.service';

const perPage = 5;

@Component({
	selector: 'ea-products',
	templateUrl: './products.component.html',
	styleUrls: ['/products.component.scss'],
})
export class ProductsComponent implements OnDestroy, AfterViewInit {
	@ViewChild('productsTable', { static: true })
	protected productsTable: ProductsTableComponent;

	public productsCategories: any;

	public loading: boolean;
	public perPage: number;

	protected settingsSmartTable: object;
	protected sourceSmartTable = new LocalDataSource();

	private ngDestroy$ = new Subject<void>();
	private $products;

	constructor(
		private readonly _productsService: ProductsService,
		private readonly modalService: NgbModal,
		private readonly productsCategoryService: ProductsCategoryService,
		private readonly _notifyService: NotifyService
	) {
		this.perPage = perPage;
		this.getCategories();
	}

	ngAfterViewInit(): void {
		this._loadDataSmartTable();
		if (this.productsTable) {
			this.productsTable.pagesChanges$
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((page: number) => {
					this._loadDataSmartTable(page);
				});
		}
	}

	openWizardNewProduct() {
		const activeModal = this.modalService.open(ProductCreateComponent, {
			size: 'lg',
			container: 'nb-layout',
			backdrop: 'static',
		});

		const modalComponent: ProductCreateComponent =
			activeModal.componentInstance;

		modalComponent.productsCategories = this.productsCategories;
	}

	async deleteSelectedRows() {
		const idsForDelete: string[] = this.productsTable.selectedProducts.map(
			(c) => c.id
		);

		try {
			this.loading = true;

			await this._productsService
				.removeByIds(idsForDelete)
				.pipe(first())
				.toPromise();

			this.loading = false;

			const message = `${idsForDelete.length} products was deleted!`;

			this._notifyService.success(message);

			this.productsTable.selectedProducts = [];
		} catch (error) {
			this.loading = false;
			const message = `Something went wrong!`;
			this._notifyService.error(message);
			this.productsTable.selectedProducts = [];
		}
	}

	protected get hasSelectedProducts(): boolean {
		return this.productsTable.hasSelectedProducts;
	}

	private async getCategories() {
		this.productsCategories = await this.productsCategoryService
			.getCategories()
			.pipe(first())
			.toPromise();
	}

	private async _loadDataSmartTable(page: number = 1) {
		let products: Product[] = [];
		if (this.$products) {
			await this.$products.unsubscribe();
		}
		this.$products = this._productsService
			.getProducts({
				skip: perPage * (page - 1),
				limit: perPage,
			})
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (p: Product[]) => {
				this.productsTable.perPage = perPage;

				const dataCount = await this.getDataCount();
				products = p;
				this.productsTable.loadDataSmartTable(
					products,
					dataCount,
					page
				);
			});
	}

	private async getDataCount() {
		return this._productsService.getCountOfProducts();
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
