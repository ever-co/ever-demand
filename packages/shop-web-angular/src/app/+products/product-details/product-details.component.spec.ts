import { of } from 'rxjs';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import { ProductDetailsComponent } from './product-details.component';

const image = (url: string, orientation: number) => ({
	locale: 'en-US',
	url,
	orientation,
	width: 1,
	height: 1,
});

describe('ProductDetailsComponent', () => {
	function create(
		options: {
			images?: object[];
			deliveryType?: DeliveryType;
			deliveryTimeMin?: number;
			deliveryTimeMax?: number;
			store?: object;
		} = {}
	) {
		const warehouseProduct = {
			id: 'wp1',
			price: 9,
			deliveryTimeMin: options.deliveryTimeMin,
			deliveryTimeMax: options.deliveryTimeMax,
			product: { id: 'p1', images: options.images ?? [image('a', 1)] },
		};
		const warehouse = { id: 'w1', products: [warehouseProduct] };
		const store = {
			deliveryType: options.deliveryType ?? DeliveryType.Delivery,
			userId: 'u1',
			registrationSystem: RegistrationSystem.Enabled,
			...options.store,
		};
		const router = { navigate: vi.fn() };
		const warehouseOrdersRouter = {
			createByProductType: vi.fn().mockResolvedValue({ id: 'o1' }),
		};
		const orderRouter = { confirm: vi.fn().mockResolvedValue({}) };
		const translate = {
			get: (key: string) =>
				of(key === 'PRODUCTS_VIEW.MINUTES' ? 'min' : 'Ready'),
		};

		const component = new ProductDetailsComponent(
			{ params: of({ warehouseId: 'w1', productId: 'p1' }) } as any,
			router as any,
			{ get: vi.fn().mockReturnValue(of(warehouse)) } as any,
			warehouseOrdersRouter as any,
			orderRouter as any,
			{ getTranslate: () => '' } as any,
			store as any,
			translate as any
		);
		component.ngOnInit();
		return { component, router, warehouseOrdersRouter, orderRouter, store };
	}

	it('loads the product of the store from the route', () => {
		const { component } = create();

		expect(component.warehouseId).toBe('w1');
		expect(component.productId).toBe('p1');
		expect(component.warehouseProduct.id).toBe('wp1');
	});

	it('shows the landscape images when there are several of them', () => {
		const { component } = create({
			images: [image('v1', 1), image('h1', 2), image('h2', 2)],
		});

		expect(component.images.map((i) => i.url)).toEqual(['h1', 'h2']);
	});

	it('shows the landscape image of a portrait + landscape pair', () => {
		const { component } = create({
			images: [image('v1', 1), image('h1', 2)],
		});

		expect(component.images.map((i) => i.url)).toEqual(['h1']);
	});

	it('shows the delivery time of the product', async () => {
		const { component } = create({ deliveryTimeMin: 10, deliveryTimeMax: 25 });
		await new Promise((resolve) => setTimeout(resolve));

		expect(component.getDeliveryTime()).toBe('10-25 min');
	});

	it('says "ready" for a quick takeaway', async () => {
		const { component } = create({
			deliveryType: DeliveryType.Takeaway,
			deliveryTimeMax: 10,
		});
		await new Promise((resolve) => setTimeout(resolve));

		expect(component.getDeliveryTime()).toBe('Ready');
	});

	it('orders and confirms the product, then opens the orders', async () => {
		const { component, router, warehouseOrdersRouter, orderRouter } =
			create();

		await component.createOrder();

		expect(warehouseOrdersRouter.createByProductType).toHaveBeenCalledWith(
			'u1',
			'w1',
			'p1',
			DeliveryType.Delivery
		);
		expect(orderRouter.confirm).toHaveBeenCalledWith('o1');
		expect(router.navigate).toHaveBeenCalledWith(['/orders']);
	});

	it('remembers the product and asks an anonymous visitor to log in first', async () => {
		const { component, router, warehouseOrdersRouter, store } = create({
			store: {
				userId: null,
				registrationSystem: RegistrationSystem.Disabled,
			},
		});

		await component.createOrder();

		expect(warehouseOrdersRouter.createByProductType).not.toHaveBeenCalled();
		expect(store).toMatchObject({
			registrationSystem: RegistrationSystem.Once,
			buyProduct: 'wp1',
			mechantId: 'w1',
		});
		expect(router.navigate).toHaveBeenCalledWith(['/login']);
	});

	it('scrolls the thumbnails by one image', () => {
		const { component } = create();
		const slide = document.createElement('div');
		const thumbnail = document.createElement('img');
		thumbnail.className = 'scroll-image';
		Object.defineProperty(thumbnail, 'offsetWidth', { value: 120 });
		slide.appendChild(thumbnail);
		slide.scrollBy = vi.fn();

		component.scrollImages(slide, 1);
		component.scrollImages(slide, -1);

		expect(slide.scrollBy).toHaveBeenNthCalledWith(1, {
			left: 120,
			behavior: 'smooth',
		});
		expect(slide.scrollBy).toHaveBeenNthCalledWith(2, {
			left: -120,
			behavior: 'smooth',
		});
	});
});
