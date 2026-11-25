import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
	fakeAsync,
	tick,
	waitForAsync,
	ComponentFixture,
	TestBed,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { GeoLocationRouter } from '@modules/client.common.angular2/routers/geo-location-router.service';
import { InviteRequestRouter } from '@modules/client.common.angular2/routers/invite-request-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { Store } from '../../../services/store.service';
import { ByLocationPage } from './by-location.page';

describe('ByLocationPage', () => {
	let component: ByLocationPage;
	let fixture: ComponentFixture<ByLocationPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ByLocationPage],
				imports: [TranslateModule.forRoot()],
				providers: [
					{ provide: Store, useValue: {} },
					{
						provide: HttpClient,
						useValue: jasmine.createSpyObj('HttpClient', ['get']),
					},
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', [
							'navigate',
							'navigateByUrl',
						]),
					},
					{
						provide: UserAuthRouter,
						useValue: jasmine.createSpyObj('UserAuthRouter', [
							'register',
						]),
					},
					{
						provide: InviteRouter,
						useValue: jasmine.createSpyObj('InviteRouter', [
							'create',
						]),
					},
					{
						provide: InviteRequestRouter,
						useValue: jasmine.createSpyObj('InviteRequestRouter', [
							'create',
						]),
					},
					{
						provide: GeoLocationRouter,
						useValue: jasmine.createSpyObj('GeoLocationRouter', [
							'getAddressByCoordinatesUsingArcGIS',
						]),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(fakeAsync(() => {
		fixture = TestBed.createComponent(ByLocationPage);
		component = fixture.componentInstance;
		// No device location, so the spec never asks the browser for one.
		spyOn<any>(component, 'getCoordinates').and.resolveTo(null);
		fixture.detectChanges();
		// ngOnInit looks the location up after 50 ms: finish it in this spec.
		tick(50);
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
		expect(component.detectingLocation).toBe(false);
	});
});
