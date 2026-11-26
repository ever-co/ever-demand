import { TestBed } from '@angular/core/testing';
import { ApolloTestingController } from 'apollo-angular/testing';
import { firstValueFrom } from 'rxjs';
import Carrier from '@modules/server.common/entities/Carrier';
import User from '@modules/server.common/entities/User';
import {
	expectOperation,
	setupApolloTesting,
} from '../../../testing/apollo-testing';
import { CarriersService } from './carriers.service';
import { InvitesService } from './invites.service';
import { OrdersService } from './orders.service';
import { UsersService } from './users.service';

const geo = {
	countryId: 0,
	city: 'Sofia',
	streetAddress: 'Vitosha',
	house: '1',
	loc: { type: 'Point', coordinates: [23.3, 42.7] },
};

describe('Users, carriers, invites and orders services (GraphQL)', () => {
	let controller: ApolloTestingController;

	beforeEach(() => {
		({ controller } = setupApolloTesting([
			UsersService,
			CarriersService,
			InvitesService,
			OrdersService,
		]));
	});

	afterEach(() => controller.verify());

	describe('UsersService', () => {
		it('getUsers() maps the customers to User entities', async () => {
			const users = TestBed.inject(UsersService);
			const result = firstValueFrom(
				users.getUsers({ skip: 0, limit: 20 }),
			);
			const op = await expectOperation(controller, 'AllUsers');
			expect(op.operation.variables).toEqual({
				pagingOptions: { skip: 0, limit: 20 },
			});
			op.flush({
				data: {
					users: [
						{
							_id: 'u1',
							firstName: 'Ada',
							lastName: 'Lovelace',
							image: '',
							email: 'ada@ever.co',
							apartment: '2',
							phone: '123',
							isBanned: false,
							geoLocation: geo,
						},
					],
				},
			});
			const [user] = await result;
			expect(user).toBeInstanceOf(User);
			expect(user.email).toBe('ada@ever.co');
			expect(user.geoLocation.city).toBe('Sofia');
		});

		it('isUserEmailExists() resolves the flag', async () => {
			const users = TestBed.inject(UsersService);
			const result = users.isUserEmailExists('ada@ever.co');
			const op = await expectOperation(controller, 'IsUserEmailExists');
			expect(op.operation.variables).toEqual({ email: 'ada@ever.co' });
			op.flush({ data: { isUserEmailExists: true } });
			await expect(result).resolves.toBe(true);
		});

		it('banUser() sends the customer id', async () => {
			const users = TestBed.inject(UsersService);
			const result = users.banUser('u1');
			const op = await expectOperation(controller, 'BanUser');
			expect(op.operation.variables).toEqual({ id: 'u1' });
			op.flush({
				data: {
					banUser: { id: 'u1', firstName: 'Ada', lastName: 'L' },
				},
			});
			await expect(result).resolves.toBeTruthy();
		});
	});

	describe('CarriersService', () => {
		it('getAllCarriers() maps to Carrier entities', async () => {
			const carriers = TestBed.inject(CarriersService);
			const result = firstValueFrom(carriers.getAllCarriers());
			(await expectOperation(controller, 'getCarriers')).flush({
				data: {
					getCarriers: [
						{
							_id: 'c1',
							firstName: 'Fast',
							lastName: 'Carrier',
							phone: '555',
							logo: '',
							isDeleted: false,
							numberOfDeliveries: 3,
							skippedOrderIds: [],
							status: 0,
							geoLocation: geo,
						},
					],
				},
			});
			const [carrier] = await result;
			expect(carrier).toBeInstanceOf(Carrier);
			expect(carrier.firstName).toBe('Fast');
			expect(carrier.numberOfDeliveries).toBe(3);
		});

		it('removeByIds() sends the ids', async () => {
			const carriers = TestBed.inject(CarriersService);
			const result = firstValueFrom(carriers.removeByIds(['c1']));
			const op = await expectOperation(controller, 'RemoveCarriersByIds');
			expect(op.operation.variables).toEqual({ ids: ['c1'] });
			op.flush({ data: { removeCarriersByIds: null } });
			await expect(result).resolves.toBeTruthy();
		});
	});

	describe('InvitesService', () => {
		it('getInvites() pages the invites', async () => {
			const invites = TestBed.inject(InvitesService);
			const result = firstValueFrom(
				invites.getInvites({ skip: 5, limit: 5 }),
			);
			const op = await expectOperation(controller, 'AllInvites');
			expect(op.operation.variables).toEqual({
				pagingOptions: { skip: 5, limit: 5 },
			});
			const list = [
				{ id: 'i1', code: '1234', apartment: '1', geoLocation: geo },
			];
			op.flush({ data: { invites: list } });
			await expect(result).resolves.toEqual(list);
		});

		it('createInvite() sends the create input', async () => {
			const invites = TestBed.inject(InvitesService);
			const input: any = {
				code: '4321',
				apartment: '1',
				geoLocation: geo,
			};
			const result = firstValueFrom(invites.createInvite(input));
			const op = await expectOperation(controller, 'CreateInvite');
			expect(op.operation.variables).toEqual({ createInput: input });
			op.flush({ data: { createInvite: { id: 'i2' } } });
			await expect(result).resolves.toEqual({ id: 'i2' });
		});

		it('removeByIds() returns the removed count', async () => {
			const invites = TestBed.inject(InvitesService);
			const result = firstValueFrom(invites.removeByIds(['i1', 'i2']));
			(await expectOperation(controller, 'RemoveInvitesByIds')).flush({
				data: { removeInvitesByIds: { n: 2 } },
			});
			await expect(result).resolves.toEqual({ n: 2 });
		});
	});

	describe('OrdersService', () => {
		it('getOrders() returns the orders', async () => {
			const orders = TestBed.inject(OrdersService);
			const result = firstValueFrom(orders.getOrders());
			const list = [
				{
					user: { _id: 'u1' },
					warehouseId: 'w1',
					totalPrice: 12,
					isCompleted: true,
				},
			];
			(await expectOperation(controller, 'Orders')).flush({
				data: { orders: list },
			});
			await expect(result).resolves.toEqual(list);
		});

		it('getDashboardCompletedOrders() returns the completed orders', async () => {
			const orders = TestBed.inject(OrdersService);
			const result = firstValueFrom(orders.getDashboardCompletedOrders());
			const list = [{ warehouseId: 'w1', totalPrice: 20 }];
			(
				await expectOperation(controller, 'GetDashboardCompletedOrders')
			).flush({
				data: { getDashboardCompletedOrders: list },
			});
			await expect(result).resolves.toEqual(list);
		});
	});
});
