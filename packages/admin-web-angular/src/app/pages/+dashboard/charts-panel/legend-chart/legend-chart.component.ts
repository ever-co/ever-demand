import { Component, Input } from '@angular/core';

import { NgxLegendItemColor } from './enum.legend-item-color';

@Component({
	selector: 'ea-legend-chart',
	styleUrls: ['./legend-chart.component.scss'],
	templateUrl: './legend-chart.component.html',
})
export class LegendChartComponent {
	/**
	 * Take an array of legend items
	 * Available iconColor: 'green', 'purple', 'light-purple', 'blue', 'yellow'
	 * @type {{iconColor: string; title: string}[]}
	 */
	@Input()
	legendItems: Array<{ iconColor: NgxLegendItemColor; title: string }> = [];
}
