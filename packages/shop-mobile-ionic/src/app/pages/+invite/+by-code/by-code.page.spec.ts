import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { OrdersService } from 'app/services/orders/orders.service';
import { Store } from '../../../services/store.service';
import { ByCodePage } from './by-code.page';
import { FormsModule } from '@angular/forms';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('ByCodePage', () => {
	let component: ByCodePage;
	let fixture: ComponentFixture<ByCodePage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ByCodePage],
			// The invite code input uses ngModel.
			imports: [...translateTesting(), FormsModule],
			providers: [
				{
					provide: Store,
					useValue: {
						inviteRequestId: null,
						inviteAddress: null,
					},
				},
				{
					provide: InviteRouter,
					useValue: createSpyObj('InviteRouter', ['getByCode']),
				},
				{
					provide: UserAuthRouter,
					useValue: createSpyObj('UserAuthRouter', ['register']),
				},
				{
					provide: Router,
					useValue: createSpyObj('Router', [
						'navigate',
						'navigateByUrl',
					]),
				},
				{
					provide: OrdersService,
					useValue: createSpyObj('OrdersService', [
						'generateOrdersByCustomerId',
					]),
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ByCodePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
