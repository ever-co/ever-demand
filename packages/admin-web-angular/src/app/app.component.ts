/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';

@Component({
	standalone: false,
	selector: 'ea-app',
	changeDetection: ChangeDetectionStrategy.Eager,
	template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
	constructor(private analytics: AnalyticsService) {}

	ngOnInit(): void {
		this.analytics.trackPageViews();
	}
}
