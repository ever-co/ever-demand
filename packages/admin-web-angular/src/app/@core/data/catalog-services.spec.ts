import { TestBed } from '@angular/core/testing';
import { ApolloTestingController } from 'apollo-angular/testing';
import { firstValueFrom } from 'rxjs';
import {
	expectOperation,
	setupApolloTesting,
} from '../../../testing/apollo-testing';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ProductsService } from './products.service';
import { ProductsCategoryService } from './productsCategory.service';

describe('ProductsService and ProductsCategoryService (GraphQL)', () => {
	let products: ProductsService;
	let categories: ProductsCategoryService;
	let controller: ApolloTestingController;

	beforeEach(() => {
		({ controller } = setupApolloTesting([
			ProductsService,
			ProductsCategoryService,
			{
				provide: ProductLocalesService,
				useValue: {
					getTranslate: (members: any[]) => members?.[0]?.value ?? '',
				},
			},
		]));
		products = TestBed.inject(ProductsService);
		categories = TestBed.inject(ProductsCategoryService);
	});

	afterEach(() => controller.verify());

	it('getProducts() pages and excludes the given products', async () => {
		const result = firstValueFrom(
			products.getProducts({ skip: 0, limit: 10 }, ['p0']),
		);
		const op = await expectOperation(controller, 'AllProducts');
		expect(op.operation.variables).toEqual({
			pagingOptions: { skip: 0, limit: 10 },
			existedProductsIds: ['p0'],
		});
		const list = [
			{ _id: 'p1', title: [{ locale: 'en-US', value: 'Pizza' }] },
		];
		op.flush({ data: { products: list } });
		await expect(result).resolves.toEqual(list);
	});

	it('create() sends the product and returns the created one', async () => {
		const input: any = {
			title: [{ locale: 'en-US', value: 'Pizza' }],
			description: [{ locale: 'en-US', value: 'Hot' }],
			images: [
				{
					locale: 'en-US',
					url: 'http://img/1.png',
					width: 1,
					height: 1,
					orientation: 0,
				},
			],
		};
		const result = firstValueFrom(products.create(input));
		const op = await expectOperation(controller, 'SaveProduct');
		expect(op.operation.variables).toEqual({ product: input });
		op.flush({ data: { createProduct: { id: 'p1', ...input } } });
		await expect(result).resolves.toMatchObject({ id: 'p1' });
	});

	it('removeByIds() removes the products', async () => {
		const result = firstValueFrom(products.removeByIds(['p1', 'p2']));
		const op = await expectOperation(controller, 'RemoveProductsByIds');
		expect(op.operation.variables).toEqual({ ids: ['p1', 'p2'] });
		op.flush({ data: { removeProductsByIds: { n: 2 } } });
		await expect(result).resolves.toEqual({ n: 2 });
	});

	it('getCategories() returns the categories', async () => {
		const result = firstValueFrom(categories.getCategories());
		const list = [
			{
				id: 'c1',
				name: [{ locale: 'en-US', value: 'Food' }],
				image: null,
			},
		];
		(await expectOperation(controller, 'allCategories')).flush({
			data: { productsCategories: list },
		});
		await expect(result).resolves.toEqual(list);
	});

	it('create() of a category sends its name and a letter image when it has none', async () => {
		const category: any = { name: [{ locale: 'en-US', value: 'drinks' }] };
		const result = firstValueFrom(categories.create(category));
		const op = await expectOperation(controller, 'SaveProductsCategory');
		expect(op.operation.variables.productsCategory.name).toEqual(
			category.name,
		);
		expect(op.operation.variables.productsCategory.image).toContain('D');
		op.flush({
			data: { createProductsCategory: { id: 'c2', ...category } },
		});
		await expect(result).resolves.toMatchObject({ id: 'c2' });
	});
});
