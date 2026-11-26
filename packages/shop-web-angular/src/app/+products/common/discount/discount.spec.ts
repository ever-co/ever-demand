import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { DiscountComponent } from './discount';

describe('DiscountComponent', () => {
	const discountOf = (price: number, initialPrice: number) => {
		const component = new DiscountComponent();
		component.currentProduct = { price, initialPrice } as any;
		return component.getDiscount();
	};

	it('gives the discount in whole percent, rounded down', () => {
		expect(discountOf(75, 100)).toBe(25);
		expect(discountOf(9.99, 12.5)).toBe(20);
	});

	it('gives 0 without a discount', () => {
		expect(discountOf(10, 10)).toBe(0);
		expect(discountOf(10, 0)).toBe(0);
		expect(new DiscountComponent().getDiscount()).toBe(0);
	});

	it('shows the circle with the initial price only for a discount', async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [DiscountComponent],
		}).compileComponents();

		const fixture = TestBed.createComponent(DiscountComponent);
		fixture.componentInstance.currentProduct = {
			price: 15,
			initialPrice: 20,
		} as any;
		fixture.detectChanges();

		const circle: HTMLElement =
			fixture.nativeElement.querySelector('.discount-circle');
		expect(circle.textContent).toContain('$20');
		expect(circle.textContent).toContain('25%');

		fixture.componentInstance.currentProduct = {
			price: 20,
			initialPrice: 20,
		} as any;
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.discount-circle')).toBeNull();
	});
});
