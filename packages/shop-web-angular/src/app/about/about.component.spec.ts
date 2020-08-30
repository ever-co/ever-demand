import 'jasmine';
import { ActivatedRoute, Data } from '@angular/router';
import { inject, TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';

describe('About', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [
				{
					provide: ActivatedRoute,
					useValue: {
						data: {
							subscribe: (fn: (value: Data) => void) =>
								fn({
									yourData: 'yolo',
								}),
						},
					},
				},
				AboutComponent,
			],
		})
	);

	it('should log ngOnInit', inject(
		[AboutComponent],
		(about: AboutComponent) => {
			spyOn(console, 'log');
			expect(console.log).not.toHaveBeenCalled();

			about.ngOnInit();
			expect(console.log).toHaveBeenCalled();
		}
	));
});
