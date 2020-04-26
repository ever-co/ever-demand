import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
	selector: 'e-cu-user-locations',
	templateUrl: './user-locations.page.html',
	styleUrls: ['./user-locations.page.scss'],
})
export class UserLocationsPage implements OnInit {
	public currentAddresses = [
		{
			house: 'sarez aparments',
			apartment: '12',
			default: 'true',
			street: 'seasons roads kasarani',
		},
		{
			house: 'giona',
			apartment: '12 B',
			default: 'false',
			street: 'likoni road',
		},
		{
			house: 'blue house',
			apartment: '12',
			default: 'false',
			street: '14 street msa',
		},
		{
			house: 'blue house',
			apartment: '12',
			default: 'false',
			street: '14 street msa',
		},
		{
			house: 'blue house',
			apartment: '12',
			default: 'false',
			street: '14 street msa',
		},
	];

	constructor(private location: Location) {}

	ngOnInit() {}

	goBack() {
		this.location.back();
	}
}
