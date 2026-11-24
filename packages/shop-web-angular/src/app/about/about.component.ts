import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'about',
	template: `
		<h1>About</h1>
		<div>
			For hot module reloading run
			<pre>npm run start:hmr</pre>
		</div>
		<div><h3>patrick@tipe.io</h3></div>
		<pre>this.localState = {{ localState | json }}</pre>
	`,
})
export class AboutComponent implements OnInit {
	public localState: any;
	constructor(public route: ActivatedRoute) {}

	ngOnInit() {
		this.route.data.subscribe((data: any) => {
			/**
			 * Your resolved data from route.
			 */
			this.localState = data.yourData;
		});

		console.log('hello `About` component');
	}
}
