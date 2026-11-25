import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Router } from '@angular/router';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { Store } from 'app/services/store.service';

import { MaintenanceInfoPage } from './maintenance-info.page';
import { createSpyObj } from 'app/testing/spies';

describe('MaintenanceInfoPage', () => {
	let component: MaintenanceInfoPage;
	let fixture: ComponentFixture<MaintenanceInfoPage>;

	beforeEach(async () => {
			await TestBed.configureTestingModule({
				declarations: [MaintenanceInfoPage],
				imports: [PipesModule],
				providers: [
					// The status poll reports the maintenance as over, so it stops.
					{
						provide: MaintenanceService,
						useValue: createSpyObj('MaintenanceService', {
							getMessage: Promise.resolve(''),
							getStatus: Promise.resolve(false),
						}),
					},
					{
						provide: Store,
						useValue: createSpyObj(
							'Store',
							['clearMaintenanceMode'],
							{ maintenanceMode: 'maintenance' }
						),
					},
					{
						provide: Router,
						useValue: createSpyObj('Router', ['navigate']),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
	});

	beforeEach(async () => {
		vi.useFakeTimers();
		fixture = TestBed.createComponent(MaintenanceInfoPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
		// Run the first 5 s status poll here, so it stops inside this spec.
		await vi.advanceTimersByTimeAsync(5000);
		vi.useRealTimers();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
		expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['']);
	});
});
