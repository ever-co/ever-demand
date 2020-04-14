import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerViewModel } from '@app/pages/+customers/customers.component';

@Component({
	selector: 'ea-ban-confirm',
	templateUrl: './ban-confirm.component.html',
	styleUrls: ['./ban-confirm.component.scss'],
})
export class BanConfirmComponent implements OnInit {
	@Input() user: CustomerViewModel;
	constructor(private readonly modal: NgbActiveModal) {}

	ngOnInit() {}
}
