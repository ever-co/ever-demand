import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	standalone: false,
	selector: 'ea-chart-panel-summary',
	styleUrls: ['./chart-panel-summary.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
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
