import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { CarouselViewComponent } from './carousel-view.component';

describe('CarouselViewComponent', () => {
	const products = (count: number) =>
		Array.from({ length: count }, (_, i) => ({ id: i })) as any[];

	function create(count: number) {
		const carousel = new CarouselViewComponent({
			getTranslate: (member: any[]) => member[0]?.url,
		} as unknown as ProductLocalesService);
		carousel.products = products(count);
		return carousel;
	}

	it('shows four products, each a quarter wide', () => {
		const carousel = create(10);

		expect(carousel.showNum).toBe(4);
		expect(carousel.itemWidth).toBe(25);
	});

	it('moves one product forward and back, not past the ends', () => {
		const carousel = create(6);

		carousel.showLeft();
		expect(carousel.currentIndex).toBe(0);

		carousel.showNext();
		carousel.showNext();
		expect(carousel.currentIndex).toBe(2);

		carousel.showLeft();
		expect(carousel.currentIndex).toBe(1);

		for (let i = 0; i < 10; i++) {
			carousel.showNext();
		}
		expect(carousel.currentIndex).toBe(5);
	});

	it('does not scroll past the last page (no blank space at the end)', () => {
		const carousel = create(6);

		carousel.currentIndex = 1;
		expect(carousel.offset).toBe(1);

		carousel.currentIndex = 5;
		expect(carousel.offset).toBe(2);

		const few = create(3);
		few.currentIndex = 2;
		expect(few.offset).toBe(0);
	});

	it('asks for more products near the end', () => {
		const carousel = create(6);
		const loadProducts = vi.fn();
		carousel.loadProducts.subscribe(loadProducts);

		carousel.showNext();
		expect(loadProducts).not.toHaveBeenCalled();

		carousel.showNext();
		expect(loadProducts).toHaveBeenCalledWith(5);
	});

	it('finds the orientation of the image shown for the locale', () => {
		const carousel = create(1);
		const images = [
			{ url: 'a.png', orientation: 1 },
			{ url: 'b.png', orientation: 2 },
		] as any[];

		expect(carousel.getImageOrientation(images)).toBe(1);
	});
});
