import 'reflect-metadata';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only `getMerchantsBuyName()` is exercised, against stub services.
jest.mock('../../../services/warehouses', () => ({
	WarehousesCarriersService: class {},
	WarehousesOrdersService: class {},
	WarehousesService: class {},
	WarehousesUsersService: class {},
	WarehousesProductsService: class {},
}));
jest.mock('../../../services/devices', () => ({ DevicesService: class {} }));
jest.mock('../../../services/orders', () => ({ OrdersService: class {} }));
jest.mock('../../../services/users', () => ({ UsersService: class {} }));
jest.mock('../../../services/geo-locations', () => ({
	GeoLocationsWarehousesService: class {},
}));

import { WarehouseResolver } from '../../../graphql/warehouses/warehouse.resolver';

describe('WarehouseResolver.getMerchantsBuyName search text', () => {
	const count = 3;

	let resolver: WarehouseResolver;
	let find: jest.Mock;
	let getMerchants: jest.Mock;

	beforeEach(() => {
		const exec = jest.fn(async () => count);
		const countDocuments = jest.fn(() => ({ exec }));

		find = jest.fn(() => ({ countDocuments }));
		getMerchants = jest.fn(async () => []);

		const warehousesService = { Model: { find }, getMerchants };

		resolver = new WarehouseResolver(
			{} as any,
			warehousesService as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any
		);
	});

	const search = (searchName: any) =>
		resolver.getMerchantsBuyName(undefined, {
			searchName,
			geoLocation: undefined,
		});

	const expectBothFiltersToUse = (pattern: string) => {
		const filter = { name: { $regex: pattern, $options: 'i' } };

		expect(find).toHaveBeenCalledTimes(1);
		expect(find).toHaveBeenCalledWith(filter);
		expect(getMerchants).toHaveBeenCalledTimes(1);
		expect(getMerchants).toHaveBeenCalledWith(filter, {
			skip: 0,
			limit: count,
		});
	};

	it('escapes regex characters in the search text', async () => {
		await search('Cafe (Main');

		expectBothFiltersToUse('Cafe \\(Main');
	});

	it('passes plain text unchanged', async () => {
		await search('pizza');

		expectBothFiltersToUse('pizza');
	});

	it('trims the search text', async () => {
		await search('  pizza  ');

		expectBothFiltersToUse('pizza');
	});

	it.each(['Cafe (Main', '[Deli', '*Star', '+Plus', 'Joe\\s', 'a.c'])(
		'builds a valid pattern that matches %p literally',
		async (name) => {
			await search(name);

			const pattern = find.mock.calls[0][0].name.$regex;
			const regex = new RegExp(pattern, 'i');

			expect(regex.test(`My ${name} Shop`)).toBe(true);
			expect(regex.test('abc')).toBe(false);
		}
	);
});
