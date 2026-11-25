import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuController } from '@ionic/angular/lazy';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { Store } from 'app/services/store.service';
import { MenuComponent } from './menu.component';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('MenuComponent', () => {
	let component: MenuComponent;
	let fixture: ComponentFixture<MenuComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MenuComponent],
			imports: [...translateTesting()],
			// ion-menu and friends, and e-cu-submenu
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{ provide: Store, useValue: { maintenanceMode: null } },
				{
					provide: WarehouseRouter,
					useValue: createSpyObj('WarehouseRouter', ['get']),
				},
				{
					provide: MenuController,
					useValue: createSpyObj('MenuController', ['enable']),
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('enables the left-hand menu for a left-to-right language at start', () => {
		const menu = TestBed.inject(MenuController) as any;

		expect(menu.enable).toHaveBeenCalledWith(true, 'ltr');
		expect(menu.enable).toHaveBeenCalledWith(false, 'rtl');
	});

	it('switches to the right-hand menu for Hebrew', () => {
		const menu = TestBed.inject(MenuController) as any;
		menu.enable.mockClear();

		TestBed.inject(TranslateService).use('he-IL');

		expect(menu.enable).toHaveBeenCalledWith(true, 'rtl');
		expect(menu.enable).toHaveBeenCalledWith(false, 'ltr');
	});
});
