import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
	selector: 'e-cu-warehouse-logo',
	styles: [
		`
			:host {
				width: 56px;
				height: 56px;
				border-radius: 50%;
				background-color: #fff;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			:host.bordered {
				border: solid #95989a 1px;
			}

			img {
				max-width: 69%;
				max-height: 69%;
				user-drag: none;
				user-select: none;
				-moz-user-select: none;
				-webkit-user-drag: none;
				-webkit-user-select: none;
				-ms-user-select: none;
				width: auto;
				height: auto;
			}

			img.light {
				opacity: 0.8;
			}
		`,
	],
	template: `
		<img [src]="logo" [ngClass]="{ bordered: border, lighted: light }" />
	`,
})
export class WarehouseLogoComponent implements OnInit {
	@Input()
	public logo: string;

	@Input()
	@HostBinding('class.bordered')
	public border: boolean = false;

	@Input()
	public light: boolean = false;

	constructor() {
		return;
	}

	ngOnInit() {
		return;
	}
}
