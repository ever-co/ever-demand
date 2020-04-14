import { Component, Input } from '@angular/core';

@Component({
	selector: 'ea-chart-panel-summary',
	styleUrls: ['./chart-panel-summary.component.scss'],
	templateUrl: './chart-panel-summary.component.html',
})
export class ChartPanelSummaryComponent {
	@Input()
	summary: Array<{
		values: {
			total: { title: string; value: number };
			completed: { title: string; value: number };
			cancelled: { title: string; value: number };
		};
		isPrice: boolean;
	}>;

	@Input()
	isLoading: boolean;
}
