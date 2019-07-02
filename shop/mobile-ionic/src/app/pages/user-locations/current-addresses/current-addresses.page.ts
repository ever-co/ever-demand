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
			house: 'blue house',
			apartment: '12',
			street: '14 street msa',
		},
		{
			house: 'giona',
			apartment: '12 B',
			street: 'likoni road',
		},
		{
			house: 'blue house',
			apartment: '12',
			street: '14 street msa',
		},
		{
			house: 'blue house',
			apartment: '12',
			street: '14 street msa',
		},
		{
			house: 'blue house',
			apartment: '12',
			street: '14 street msa',
		}
	];
	constructor(private router: Router) { }

	ngOnInit() {
	}

	addNewAddress() {
		this.router.navigate(['/user-addresses/new']);
	}
}
