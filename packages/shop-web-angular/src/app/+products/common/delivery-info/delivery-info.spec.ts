import { TestBed } from '@angular/core/testing';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { Store } from 'app/services/store';
import { DeliveryInfoComponent } from './delivery-info';

describe('DeliveryInfoComponent', () => {
	function create(deliveryType: DeliveryType, product: object | null) {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [DeliveryInfoComponent],
			providers: [{ provide: Store, useValue: { deliveryType } }],
		});
		TestBed.inject(TranslateService).setTranslation('en-US', {
			PRODUCTS_VIEW: {
				DELIVERY: 'Delivery',
				TAKEAWAY: 'Takeaway',
				MINUTES: 'min',
				READYFOR: 'Ready now',
			},
		});
		TestBed.inject(TranslateService).use('en-US');

		const fixture = TestBed.createComponent(DeliveryInfoComponent);
		fixture.componentInstance.currentProduct = product as any;
		fixture.detectChanges();
		return fixture;
	}

	it('shows the delivery time of the product for delivery', async () => {
		const fixture = create(DeliveryType.Delivery, {
			deliveryTimeMin: 20,
			deliveryTimeMax: 40,
			isDeliveryRequired: true,
		});
		await fixture.whenStable();
		const info = fixture.componentInstance;

		expect(info.getProductDeliveryLine1()).toBe('20-40 min');
		expect(info.getProductDeliveryLine2()).toBe('Delivery');
		expect(info.getProductDeliverySignIconName()).toBe('directions_bike');
	});

	it('falls back to the default delivery time of the environment', async () => {
		const fixture = create(DeliveryType.Delivery, {
			isDeliveryRequired: true,
		});
		await fixture.whenStable();

		expect(fixture.componentInstance.getProductDeliveryLine1()).toBe(
			`${environment.DELIVERY_TIME_MIN}-${environment.DELIVERY_TIME_MAX} min`
		);
	});

	it('says "ready" for a quick takeaway', async () => {
		const fixture = create(DeliveryType.Takeaway, {
			deliveryTimeMin: 5,
			deliveryTimeMax: 10,
			isDeliveryRequired: false,
		});
		await fixture.whenStable();
		const info = fixture.componentInstance;

		expect(info.getProductDeliveryLine1()).toBe('Ready now');
		expect(info.getProductDeliveryLine2()).toBe('Takeaway');
		expect(info.getProductDeliverySignIconName()).toBe('flash_on');
	});

	it('shows the time of a slow takeaway', async () => {
		const fixture = create(DeliveryType.Takeaway, {
			deliveryTimeMin: 20,
			deliveryTimeMax: 30,
		});
		await fixture.whenStable();

		expect(fixture.componentInstance.getProductDeliveryLine1()).toBe(
			'20-30 min'
		);
	});

	it('knows an instant delivery (15 minutes at most)', () => {
		const info = create(DeliveryType.Delivery, null).componentInstance;

		expect(
			info.getIsInstant({
				isDeliveryRequired: true,
				deliveryTimeMax: 15,
			} as any)
		).toBe(true);
		expect(
			info.getIsInstant({
				isDeliveryRequired: true,
				deliveryTimeMax: 30,
			} as any)
		).toBe(false);
		expect(
			info.getIsInstant({ isDeliveryRequired: false } as any)
		).toBe(true);
		expect(info.getIsInstant(null)).toBe(false);
	});

	it('shows nothing without a product', () => {
		const info = create(DeliveryType.Delivery, null).componentInstance;

		expect(info.getProductDeliveryLine1()).toBe('');
		expect(info.getProductDeliveryLine2()).toBe('');
		expect(info.getProductDeliverySignIconName()).toBe('');
	});
});
