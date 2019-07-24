import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'e-cu-current-addresses',
	templateUrl: './current-addresses.page.html',
	styleUrls: ['./current-addresses.page.css'],
})
export class CurrentAddressesPage implements OnInit {

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
		}
	];
	constructor(private router: Router) { }

	ngOnInit() {
	}
}
