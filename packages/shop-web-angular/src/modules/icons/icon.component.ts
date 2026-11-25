import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IconsService } from './icons.service';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'ever-icon',
	styles: [
		`
			mat-icon {
				display: flex;
				width: 100%;
				height: 100%;
			}
		`,
	],
	template: `
		<mat-icon
			class="ever-icon"
			[ngClass]="'ever-icon-' + type"
			[svgIcon]="IconsService.namespace + ':' + type"
		>
		</mat-icon>
	`,
})
export class IconComponent implements OnInit {
	public readonly IconsService: typeof IconsService = IconsService;

	@Input()
	public readonly type: string;

	constructor(private readonly iconsService: IconsService) {}

	ngOnInit() {
		this.iconsService.ensureRegistered(this.type);
	}
}
