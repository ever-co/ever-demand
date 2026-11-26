import {
	Component,
	Input,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
	standalone: false,
	styleUrls: ['./product-image.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './product-image.component.html',
})
export class ProductImageComponent {
	@Input()
	rowData: any;

	constructor(private router: Router) {}

	redirect() {
		this.router.navigate([`products/list/${this.rowData.id}/edit`]);
	}
}
