import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { OrdersService } from 'app/services/orders/orders.service';
import { Store } from '../../../services/store.service';
import { ByCodePage } from './by-code.page';

describe('ByCodePage', () => {
	let component: ByCodePage;
	let fixture: ComponentFixture<ByCodePage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ByCodePage],
				imports: [TranslateModule.forRoot()],
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
						useValue: jasmine.createSpyObj('InviteRouter', [
							'getByCode',
						]),
					},
					{
						provide: UserAuthRouter,
						useValue: jasmine.createSpyObj('UserAuthRouter', [
							'register',
						]),
					},
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', [
							'navigate',
							'navigateByUrl',
						]),
					},
					{
						provide: OrdersService,
						useValue: jasmine.createSpyObj('OrdersService', [
							'generateOrdersByCustomerId',
						]),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(ByCodePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
