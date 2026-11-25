import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
	fakeAsync,
	tick,
	waitForAsync,
	ComponentFixture,
	TestBed,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { Store } from 'app/services/store.service';

import { MaintenanceInfoPage } from './maintenance-info.page';

describe('MaintenanceInfoPage', () => {
	let component: MaintenanceInfoPage;
	let fixture: ComponentFixture<MaintenanceInfoPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [MaintenanceInfoPage],
				imports: [PipesModule],
				providers: [
					// The status poll reports the maintenance as over, so it stops.
					{
						provide: MaintenanceService,
						useValue: jasmine.createSpyObj('MaintenanceService', {
							getMessage: Promise.resolve(''),
							getStatus: Promise.resolve(false),
						}),
					},
					{
						provide: Store,
						useValue: jasmine.createSpyObj(
							'Store',
							['clearMaintenanceMode'],
							{ maintenanceMode: 'maintenance' }
						),
					},
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', ['navigate']),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(fakeAsync(() => {
		fixture = TestBed.createComponent(MaintenanceInfoPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
		// Run the first 5 s status poll here, so it stops inside this spec.
		// fakeAsync fails if the poll is still scheduled afterwards.
		tick(5000);
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
		expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['']);
	});
});
