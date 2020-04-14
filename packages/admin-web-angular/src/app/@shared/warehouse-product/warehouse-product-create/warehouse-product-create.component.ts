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
import { AddWarehouseProductsComponent } from '../forms/add-warehouse-products-table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehousesService } from '../../../@core/data/warehouses.service';
import { WizardComponent } from 'angular2-wizard';
import { TranslateService } from '@ngx-translate/core';
import { NbThemeService } from '@nebular/theme';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import { ProductsCategoryService } from '@app/@core/data/productsCategory.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { NotifyService } from '@app/@core/services/notify/notify.service';

const perPage = 3;

@Component({
	selector: 'ea-warehouse-product-create',
	templateUrl: './warehouse-product-create.component.html',
	styleUrls: ['./warehouse-product-create.component.scss'],
})
export class WarehouseProductCreateComponent implements OnInit, OnDestroy {
	loading: boolean;

	currentThemeCosmic: boolean = false;

	warehouseId: string;
	BUTTON_DONE: string = 'BUTTON_DONE';
	BUTTON_NEXT: string = 'BUTTON_NEXT';
	BUTTON_PREV: string = 'BUTTON_PREV';
	productsCategories: ProductsCategory[];
	selectedWarehouse: Warehouse;
	perPage: number;
	choiced: string;

	@ViewChild('warehouseAddChoice', { static: true })
	warehouseAddChoice: WarehouseAddChoiceComponent;

	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('productsTable')
	productsTable: ProductsTableComponent;

	@ViewChild('addWarehouseProductsTable')
	addWarehouseProductsTable: AddWarehouseProductsComponent;

	@ViewChild('wizzardFrom')
	wizzardFrom: WizardComponent;

	@ViewChild('wizzardFromStep1', { static: true })
	wizzardFromStep1: any;

	hasSelectedProducts = () => false;
	validAllProducts = () => false;

	readonly form: FormGroup = this._formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	$productsTablePagesChanges: any;

	private ngDestroy$ = new Subject<void>();
	private createdProducts: Product[] = [];
	private selectedProducts: any[] = [];
	isSetp2: boolean;

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

	get hasCoiced() {
		return this.choiced;
	}

	get isValidBasicInfoForm() {
		return this.basicInfo && this.basicInfo.valid && this.isSetp2;
	}

	async addProducts() {
		this.loading = true;
		try {
			const productsForAdd = this.addWarehouseProductsTable
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
		this.isSetp2 = true;
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
				let existedProductsIds = this.selectedWarehouse.products.map(
					(product: WarehouseProduct) => product.productId
				);

				if (this.createdProducts) {
					for (const product of this.createdProducts) {
						existedProductsIds.push(product.id);
					}
				}

				let products = await this._productsService
					.getProducts(
						{
							skip: perPage * (page - 1),
							limit: perPage,
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

			if (this.productsTable) {
				this.$productsTablePagesChanges = this.productsTable.pagesChanges$
					.pipe(takeUntil(this.ngDestroy$))
					.subscribe((page: number) => {
						loadDataSmartTable(page);
					});
			}

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
		this.isSetp2 = false;
		if (this.choiced === 'new') {
			if (this.basicInfo.valid) {
				const productCreateObject: IProductCreateObject = await this.basicInfoForm.setupProductCreateObject();
				const product = await this._productsService
					.create(productCreateObject)
					.pipe(first())
					.toPromise();
				this.createdProducts.push(product);

				const message = `Product ${productCreateObject.title[0].value} is created`;
				this._notifyService.success(message);
			}
		} else {
			this.selectedProducts = this.productsTable.selectedProducts;
		}
		const newCreatedProducts = this.createdProducts.map((p) => {
			return {
				id: p.id,
				title: p.title[0].value,
			};
		});
		this.addWarehouseProductsTable.loadDataSmartTable(
			[...newCreatedProducts, ...this.selectedProducts],
			this.warehouseId
		);

		this.validAllProducts = () =>
			this.addWarehouseProductsTable.productsIsValid();
	}

	onStep2Prev() {
		if (this.choiced === 'existing') {
			this.selectedProducts = [];
			this.hasSelectedProducts = () => true;
		}
		this.choiced = null;
	}

	onStep3Prev() {
		this.isSetp2 = true;
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
