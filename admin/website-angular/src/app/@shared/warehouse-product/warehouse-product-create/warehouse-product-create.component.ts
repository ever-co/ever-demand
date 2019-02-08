import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { WarehouseAddChoiceComponent } from '../forms';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BasicInfoFormComponent } from '../../product/forms';
import { ProductsTableComponent } from '../../product/forms/products-table';
import { ProductsService } from '../../../@core/data/products.service';
import Product from '@modules/server.common/entities/Product';
import { IProductCreateObject } from '@modules/server.common/interfaces/IProduct';
import { WarehouseProductsComponent } from '../forms/warehouse-products-table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehousesService } from '../../../@core/data/warehouses.service';
import { WizardComponent } from 'angular2-wizard';
import { TranslateService } from '@ngx-translate/core';
import { NbThemeService } from '@nebular/theme';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import { ProductsCategoryService } from 'app/@core/data/productsCategory.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { NotifyService } from 'app/@core/services/notify/notify.service';

const perPage = 3;

@Component({
	selector: 'ea-warehouse-product-create',
	templateUrl: './warehouse-product-create.component.html',
	styleUrls: ['./warehouse-product-create.component.scss']
})
export class WarehouseProductCreateComponent implements OnInit, OnDestroy {
	loading: boolean;

	private ngDestroy$ = new Subject<void>();
	private createdProduct: Product[] = [];
	private selectedProduct: any[] = [];
	public currentThemeCosmic: boolean = false;

	public warehouseId: string;
	public BUTTON_DONE: string = 'BUTTON_DONE';
	public BUTTON_NEXT: string = 'BUTTON_NEXT';
	public BUTTON_PREV: string = 'BUTTON_PREV';
	public productsCategories: ProductsCategory[];
	public selectedWarehouse: Warehouse;
	public perPage: number;

	@ViewChild('warehouseAddChoice')
	public warehouseAddChoice: WarehouseAddChoiceComponent;

	@ViewChild('basicInfoForm')
	public basicInfoForm: BasicInfoFormComponent;

	@ViewChild('productsTable')
	public productsTable: ProductsTableComponent;

	@ViewChild('warehouseProductsTable')
	public warehouseProductsTable: WarehouseProductsComponent;

	@ViewChild('wizzardFrom')
	wizzardFrom: WizardComponent;

	@ViewChild('wizzardFromStep1')
	wizzardFromStep1: any;

	public choiced: string;
	public hasSelectedProducts = () => false;
	public validAllProducts = () => false;

	public readonly form: FormGroup = this._formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder)
	});

	public readonly basicInfo = this.form.get('basicInfo') as FormControl;
	$productsTablePagesChanges: any;

	constructor(
		private readonly _formBuilder: FormBuilder,
		private readonly _productsService: ProductsService,
		private readonly _warehousesService: WarehousesService,
		private readonly _activeModal: NgbActiveModal,
		private readonly _translateService: TranslateService,
		private readonly _themeService: NbThemeService,
		private readonly _productsCategoryService: ProductsCategoryService,
		private readonly _notifyService: NotifyService
	) {
		this.perPage = perPage;
		this.loadProductCategories();
		this.checkCurrentTheme();
	}

	ngOnInit(): void {
		this.wizzardFromStep1.showNext = false;
		this.warehouseAddChoice.choice
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (res) => {
				this.choiced = res;
			});
	}

	checkCurrentTheme() {
		if (this._themeService.currentTheme === 'cosmic') {
			this.currentThemeCosmic = true;
		}
	}
	get buttonDone() {
		return this._translate(this.BUTTON_DONE);
	}

	get buttonNext() {
		return this._translate(this.BUTTON_NEXT);
	}

	get buttonPrevious() {
		return this._translate(this.BUTTON_PREV);
	}

	public get hasCoiced() {
		return this.choiced;
	}

	async addProducts() {
		this.loading = true;
		try {
			const productsForAdd = this.warehouseProductsTable
				.allWarehouseProducts;
			const res = await this._warehousesService
				.addProducts(this.warehouseId, productsForAdd)
				.pipe(first())
				.toPromise();
			this.loading = false;
			const message = `${productsForAdd.length} products was added`;
			this._notifyService.success(message);
			this.cancel();
		} catch (error) {
			let message = `Something went wrong`;
			if (error.message === 'Validation error') {
				message = error.message;
			}
			this.loading = false;
			this._notifyService.error(message);
			this.cancel();
		}
	}

	async onStep1Next() {
		if (this.choiced === 'existing') {
			this.hasSelectedProducts = () => {
				if (this.productsTable) {
					return this.productsTable.hasSelectedProducts;
				}
				return false;
			};
			if (this.$productsTablePagesChanges) {
				this.$productsTablePagesChanges.unsubscribe();
			}

			const loadDataSmartTable = async (page = 1) => {
				const existedProductsIds = this.selectedWarehouse.products.map(
					(product: WarehouseProduct) => product.productId
				);

				const products = await this._productsService
					.getProducts(
						{
							skip: perPage * (page - 1),
							limit: perPage
						},
						existedProductsIds
					)
					.pipe(first())
					.toPromise();

				const dataCount = await this.getDataCount(existedProductsIds);

				this.productsTable.loadDataSmartTable(
					products,
					dataCount,
					page
				);
			};

			this.$productsTablePagesChanges = this.productsTable.pagesChanges$
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((page: number) => {
					loadDataSmartTable(page);
				});

			await loadDataSmartTable();
		}
	}

	selectedChoice() {
		if (this.choiced) {
			this.onStep1Next();
			this.wizzardFrom.next();
		}
	}

	async onStep2Next() {
		if (this.choiced === 'new') {
			if (this.basicInfo.valid) {
				const productCreateObject: IProductCreateObject = await this.basicInfoForm.setupProductCreateObject();
				const product = await this._productsService
					.create(productCreateObject)
					.pipe(first())
					.toPromise();
				this.basicInfo.reset();
				this.createdProduct.push(product);

				const message = `Product ${
					productCreateObject.title[0].value
				} is created`;
				this._notifyService.success(message);
			}
		} else {
			this.selectedProduct = this.productsTable.selectedProducts;
		}
		const newCreatedProduct = this.createdProduct.map((p) => {
			return {
				id: p.id,
				title: p.title[0].value
			};
		});
		this.warehouseProductsTable.loadDataSmartTable(
			[...newCreatedProduct, ...this.selectedProduct],
			this.warehouseId
		);

		this.validAllProducts = () =>
			this.warehouseProductsTable.productsIsValid();
	}

	onStep2Prev() {
		if (this.choiced === 'new') {
			this.basicInfo.reset();
		} else {
			this.productsTable.selectProductTmp({ selected: [] });
		}
		this.choiced = null;
	}

	async loadProductCategories() {
		this.productsCategories = await this._productsCategoryService
			.getCategories()
			.pipe(first())
			.toPromise();
	}

	cancel() {
		this._activeModal.dismiss('canceled');
	}

	private async getDataCount(existedProductsIds: string[]) {
		return this._productsService.getCountOfProducts(existedProductsIds);
	}

	private _translate(key: string): string {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
