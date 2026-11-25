import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GeoLocationRouter } from '@modules/client.common.angular2/routers/geo-location-router.service';
import { InviteRequestRouter } from '@modules/client.common.angular2/routers/invite-request-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { Store } from '../../../services/store.service';
import { ByLocationPage } from './by-location.page';
import { vi } from 'vitest';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('ByLocationPage', () => {
	let component: ByLocationPage;
	let fixture: ComponentFixture<ByLocationPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ByLocationPage],
			imports: [...translateTesting()],
			providers: [
				{ provide: Store, useValue: {} },
				{
					provide: HttpClient,
					useValue: createSpyObj('HttpClient', ['get']),
				},
				{
					provide: Router,
					useValue: createSpyObj('Router', [
						'navigate',
						'navigateByUrl',
					]),
				},
				{
					provide: UserAuthRouter,
					useValue: createSpyObj('UserAuthRouter', ['register']),
				},
				{
					provide: InviteRouter,
					useValue: createSpyObj('InviteRouter', ['create']),
				},
				{
					provide: InviteRequestRouter,
					useValue: createSpyObj('InviteRequestRouter', ['create']),
				},
				{
					provide: GeoLocationRouter,
					useValue: createSpyObj('GeoLocationRouter', [
						'getAddressByCoordinatesUsingArcGIS',
					]),
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(async () => {
		vi.useFakeTimers();
		fixture = TestBed.createComponent(ByLocationPage);
		component = fixture.componentInstance;
		// No device location, so the spec never asks the browser for one.
		vi.spyOn<any, any>(component, 'getCoordinates').mockResolvedValue(null);
		fixture.detectChanges();
		// ngOnInit looks the location up after 50 ms: finish it in this spec.
		await vi.advanceTimersByTimeAsync(50);
		vi.useRealTimers();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
		expect(component.detectingLocation).toBe(false);
	});
});
