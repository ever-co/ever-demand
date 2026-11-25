import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormHelpers } from './helpers';

describe('FormHelpers.deepMark', () => {
	const build = () =>
		new FormGroup({
			name: new FormControl(''),
			location: new FormGroup({
				city: new FormControl(''),
				coordinates: new FormArray([
					new FormControl(1),
					new FormControl(2),
				]),
			}),
		});

	it('marks every nested control as touched', () => {
		const form = build();
		FormHelpers.deepMark(form, 'touched');

		expect(form.get('name')!.touched).toBe(true);
		expect(form.get('location.city')!.touched).toBe(true);
		expect(
			(form.get('location.coordinates') as FormArray).at(1).touched,
		).toBe(true);
	});

	it('marks every nested control as dirty, then pristine again', () => {
		const form = build();
		FormHelpers.deepMark(form, 'dirty');
		expect(form.get('location.city')!.dirty).toBe(true);

		FormHelpers.deepMark(form, 'pristine');
		expect(form.get('location.city')!.dirty).toBe(false);
	});
});
