import { createNgModule, EnvironmentInjector, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ModalController } from '@ionic/angular/modal-controller';
import { provideIonicAngular } from '@ionic/angular/provide';
import { Apollo } from 'apollo-angular';
import { EMPTY } from 'rxjs';
import { CarrierService } from '../services/carrier.service';
import { ProductsCategoryService } from '../services/products-category.service';
import { PromotionService } from '../services/promotion.service';
import { WarehouseOrdersService } from '../services/warehouse-orders.service';
import { CarrierssPageModule } from './+carriers/carriers.module';
import { CustomersPageModule } from './+customers/customers.module';
import { PromotionModule } from './+promotions/promotion.module';
import { PromotionTableModule } from './+promotions/promotion-table-page/promotion-table.module';
import { WarehousePageModule } from './+warehouse/warehouse.module';

/**
 * The NgModule IonicModule provided a ModalController in every module that imported it, so a
 * popup opened from a lazy page was created in that page's injector and could use the services
 * the page module (or a popup module it imports) provides. The page modules keep that by
 * providing the standalone ModalController themselves; the root one only sees root services.
 */
describe('ModalController of the lazy merchant pages', () => {
	beforeEach(() => {
		const query = () => ({ valueChanges: EMPTY });
		TestBed.configureTestingModule({
			providers: [
				provideRouter([]),
				provideIonicAngular(),
				{ provide: Apollo, useValue: { watchQuery: query, query: () => EMPTY, mutate: () => EMPTY } },
			],
		});
	});

	// [page, lazy route modules from the outermost to the page's own, a service they provide].
	// The track page is left out: ionic-selectable's package does not load under Vitest/Node.
	const cases: [string, Type<unknown>[], Type<unknown>][] = [
		['carriers (carrier edit popup)', [CarrierssPageModule], CarrierService],
		['customers', [CustomersPageModule], WarehouseOrdersService],
		['warehouse (product type popups)', [WarehousePageModule], ProductsCategoryService],
		['promotions (promotion popup)', [PromotionModule, PromotionTableModule], PromotionService],
	];

	it.each(cases)('%s: modals resolve the page module services', (_name, routeModules, service) => {
		const root = TestBed.inject(EnvironmentInjector);
		const page = routeModules.reduce<{ injector: EnvironmentInjector }>(
			(parent, module) => createNgModule(module, parent.injector),
			{ injector: root }
		);
		const modals = page.injector.get(ModalController);

		expect(modals).not.toBe(TestBed.inject(ModalController));
		// ModalController.create() builds the modal component in this environment injector
		const modalInjector = (modals as unknown as { environmentInjector: EnvironmentInjector })
			.environmentInjector;
		expect(modalInjector).toBe(page.injector);
		expect(root.get(service, null)).toBeNull();
		expect(modalInjector.get(service)).toBeInstanceOf(service);
	});
});
