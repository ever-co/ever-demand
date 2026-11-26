import { FormBuilder } from '@angular/forms';
import { SignupComponent, slugValidator } from './signup.component';

const PLANS = [
	{ plan: 'starter', label: 'Starter', includedMembers: 15, extraMembers: false, maxStores: 3, monthlyPrice: 0, annualMonthlyPrice: 0, paid: false },
	{ plan: 'small_business', label: 'Business', includedMembers: 25, extraMembers: true, maxStores: 3, monthlyPrice: 49, annualMonthlyPrice: 34, extraMemberPrice: 5, paid: true },
];

describe('SignupComponent (address suggestion and live check)', () => {
	let tenants: { isSlugAvailable: ReturnType<typeof vi.fn>; plans: ReturnType<typeof vi.fn> };
	let flow: { signup: ReturnType<typeof vi.fn> };
	let component: SignupComponent;

	beforeEach(() => {
		vi.useFakeTimers();
		tenants = {
			isSlugAvailable: vi.fn().mockResolvedValue(true),
			plans: vi.fn().mockResolvedValue(PLANS),
		};
		flow = { signup: vi.fn().mockResolvedValue({ kind: 'dashboard' }) };
		component = new SignupComponent(new FormBuilder(), tenants as any, flow as any);
		component.ngOnInit();
	});

	afterEach(() => {
		component.ngOnDestroy();
		vi.useRealTimers();
	});

	const set = (name: string, value: string) => {
		const control = component.form.get(name);
		control.setValue(value);
		control.markAsDirty();
	};

	it('suggests the address from the business name', () => {
		set('businessName', 'Green Grocer');
		expect(component.form.get('slug').value).toBe('green-grocer');

		set('businessName', 'Green Grocer & Sons');
		expect(component.form.get('slug').value).toBe('green-grocer-and-sons');
	});

	it('stops suggesting once the owner types an address, and resumes when it is cleared', () => {
		set('businessName', 'Green Grocer');
		set('slug', 'my-shop');
		component.onSlugInput();

		set('businessName', 'Something Else');
		expect(component.form.get('slug').value).toBe('my-shop');

		set('slug', '');
		component.onSlugInput();
		set('businessName', 'Blue Bakery');
		expect(component.form.get('slug').value).toBe('blue-bakery');
	});

	it('checks a valid address with the API after a pause', async () => {
		set('businessName', 'Green Grocer');
		expect(tenants.isSlugAvailable).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(450);
		expect(tenants.isSlugAvailable).toHaveBeenCalledTimes(1);
		expect(tenants.isSlugAvailable).toHaveBeenCalledWith('green-grocer');
		expect(component.slugStatus).toBe('available');
	});

	it('a taken address blocks the submit', async () => {
		tenants.isSlugAvailable.mockResolvedValue(false);
		set('businessName', 'Green Grocer');
		set('email', 'owner@green.test');
		set('password', 'long-enough');
		await vi.advanceTimersByTimeAsync(450);

		expect(component.slugStatus).toBe('taken');
		expect(component.form.valid).toBe(true);
		expect(component.canSubmit).toBe(false);

		await component.submit();
		expect(flow.signup).not.toHaveBeenCalled();
	});

	it('an invalid address is never sent to the API and shows why', async () => {
		set('slug', 'Bad Slug!');
		await vi.advanceTimersByTimeAsync(450);

		expect(tenants.isSlugAvailable).not.toHaveBeenCalled();
		expect(component.errorOf('slug')).toBe('FORMAT');
		expect(slugValidator(component.form.get('slug'))).toEqual({ slug: 'FORMAT' });

		set('slug', 'ab');
		expect(component.errorOf('slug')).toBe('TOO_SHORT');
	});

	it('submits the owner, the address and the chosen plan', async () => {
		await vi.advanceTimersByTimeAsync(0);
		expect(component.plans.map((p) => p.plan)).toEqual(['starter', 'small_business']);

		set('businessName', 'Green Grocer');
		set('firstName', 'Ada');
		set('email', 'owner@green.test');
		set('password', 'long-enough');
		set('plan', 'small_business');
		set('interval', 'annual');
		await vi.advanceTimersByTimeAsync(450);

		expect(component.canSubmit).toBe(true);
		await component.submit();

		expect(flow.signup).toHaveBeenCalledWith(
			{
				businessName: 'Green Grocer',
				slug: 'green-grocer',
				email: 'owner@green.test',
				password: 'long-enough',
				firstName: 'Ada',
				lastName: '',
			},
			PLANS[1],
			'annual',
		);
		expect(component.error).toBeNull();
	});

	it('shows the API error of a refused signup', async () => {
		flow.signup.mockRejectedValue(new Error('An account with this email exists already: log in instead'));
		set('businessName', 'Green Grocer');
		set('email', 'owner@green.test');
		set('password', 'long-enough');
		await vi.advanceTimersByTimeAsync(450);

		await component.submit();
		expect(component.error).toMatch(/exists already/);
		expect(component.submitting).toBe(false);
	});
});
