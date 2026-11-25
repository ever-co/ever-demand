import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuController } from '@ionic/angular/lazy';
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
});
