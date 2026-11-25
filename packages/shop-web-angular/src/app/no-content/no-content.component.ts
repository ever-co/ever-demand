import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'no-content',
	template: `
		<div>
			<h1>404: page missing</h1>
		</div>
	`,
})
export class NoContentComponent {}
