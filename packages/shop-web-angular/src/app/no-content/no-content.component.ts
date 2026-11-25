import { Component } from '@angular/core';

@Component({
	standalone: false,
	selector: 'no-content',
	template: `
		<div>
			<h1>404: page missing</h1>
		</div>
	`,
})
export class NoContentComponent {}
