import {
	Component,
	OnInit,
	Input,
	ChangeDetectionStrategy,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerViewModel } from '@app/pages/+customers/customers.component';

@Component({
	standalone: false,
	selector: 'ea-ban-confirm',
	templateUrl: './ban-confirm.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./ban-confirm.component.scss'],
})
export class BanConfirmComponent implements OnInit {
	@Input() user: CustomerViewModel;
	constructor(public readonly modal: NgbActiveModal) {}

	ngOnInit() {}
}
