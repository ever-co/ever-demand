import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { BasicInfoFormComponent } from '../../../../@shared/product/forms/basic-info';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import Product from '@modules/server.common/entities/Product';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../../@core/data/products.service';
import { takeUntil, first } from 'rxjs/operators';
import { ToasterService } from 'angular2-toaster';
import { ProductsCategoryService } from '../../../../@core/data/productsCategory.service';
import 'rxjs/add/operator/switchMap';
import { Location } from '@angular/common';

@Component({
	styleUrls: ['./product-edit.component.scss'],
	templateUrl: './product-edit.component.html',
})
export class ProductEditComponent implements OnInit, OnDestroy {
	private ngDestroy$ = new Subject<void>();

	@ViewChild('basicInfoForm', { static: true })
	public basicInfoForm: BasicInfoFormComponent;

	public readonly form: FormGroup = this.formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
	});

	storeId: string;

	public readonly basicInfo = this.form.get('basicInfo') as FormControl;

	protected product$: Observable<Product>;
	protected status;
	product: any;

	public productsCategories: any;
	public loading: boolean;

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly activatedRoute: ActivatedRoute,
		private readonly productsService: ProductsService,
		private readonly toasterService: ToasterService,
		private readonly router: Router,
		private readonly productsCategoryService: ProductsCategoryService,
		private location: Location
	) {
		this.loadProductCategories();
		this.product$ = this.activatedRoute.params.switchMap((p) => {
			return this.productsService.getProductById(p.id);
		});
	}

	public get isProductValid() {
		return this.basicInfo.valid && this.status === 'changes';
	}

	protected async updateProduct() {
		try {
			const res = await this.basicInfoForm.setupProductCreateObject();
			this.loading = true;
			const updatedProd = await this.productsService
				.save({
					_id: this.product.id,
					title: res.title,
					description: res.description,
					details: res.details,
					images: res.images,
					categories: res.categories,
				} as Product)
				.pipe(first())
				.toPromise();

			this.toasterService.pop(
				'success',
				`Product ${updatedProd.title} was updated!`
			);
			this.loading = false;
			await this.router.navigate([`/products/list/${updatedProd.id}`], {
				relativeTo: this.activatedRoute,
			});
		} catch (err) {
			this.loading = false;
			this.toasterService.pop(
				'error',
				`Error in updating carrier: "${err.message}"`
			);
		}
	}

	back() {
		this.location.back();
	}

	ngOnInit(): void {
		this.basicInfoForm.productCategories = this.productsCategories;

		this.product$.pipe(takeUntil(this.ngDestroy$)).subscribe((product) => {
			this.basicInfoForm.productCategories = this.productsCategories;
			this.basicInfoForm.setValue(product);
			this.product = product;
			this.changes();
		});
	}

	async changes() {
		this.basicInfo.valueChanges
			.pipe(first())
			.toPromise()
			.then(() => {
				this.status = 'changes';
			});
	}

	async loadProductCategories() {
		this.productsCategories = await this.productsCategoryService
			.getCategories()
			.pipe(first())
			.toPromise();
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
