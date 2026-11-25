import { UntypedFormBuilder } from '@angular/forms';
import { Country } from '@modules/server.common/entities/GeoLocation';
import { LocationFormComponent, isEmpty } from './location.component';

describe('isEmpty (lodash semantics of the location form)', () => {
	it('is true for nothing, an empty string and a number', () => {
		expect(isEmpty(null)).toBe(true);
		expect(isEmpty(undefined)).toBe(true);
		expect(isEmpty('')).toBe(true);
		expect(isEmpty(12)).toBe(true);
		expect(isEmpty([])).toBe(true);
		expect(isEmpty({})).toBe(true);
	});

	it('is false for text', () => {
		expect(isEmpty('Sofia')).toBe(false);
		expect(isEmpty(['a'])).toBe(false);
	});
});

describe('LocationFormComponent', () => {
	function create() {
		const inviteRequestRouter = {
			create: vi.fn().mockImplementation(async (request) => request),
		};
		const form = new LocationFormComponent(
			new UntypedFormBuilder(),
			{} as any,
			inviteRequestRouter as any
		);
		form.ngOnInit();
		return { form, inviteRequestRouter };
	}

	it('is valid only with the address and an apartment (or no apartment)', () => {
		const { form } = create();

		form.formControl.patchValue({
			countryId: String(Country.BG),
			city: 'Sofia',
			streetAddress: 'Vitosha',
			house: '10',
		});
		expect(form.statusForm).toBeFalsy();

		form.isApartment.setValue(false);
		expect(form.statusForm).toBeTruthy();

		form.isApartment.setValue('checked');
		form.apartament.setValue('5');
		expect(form.statusForm).toBeTruthy();
	});

	it('sends the address with the coordinates as longitude, latitude', async () => {
		const { form, inviteRequestRouter } = create();
		form.coordinates = { type: 'Point', coordinates: [42.6, 23.3] };
		form.formControl.patchValue({
			city: 'Sofia',
			streetAddress: 'Vitosha',
			house: '10',
			apartament: '',
		});

		await form.createInviteRequest();

		expect(inviteRequestRouter.create).toHaveBeenCalledWith(
			expect.objectContaining({
				apartment: '0',
				geoLocation: expect.objectContaining({
					loc: { type: 'Point', coordinates: [23.3, 42.6] },
					city: 'Sofia',
					streetAddress: 'Vitosha',
					house: '10',
				}),
			})
		);
		expect(form.getCreateUserInfo().geoLocation.house).toBe('10');
	});
});
