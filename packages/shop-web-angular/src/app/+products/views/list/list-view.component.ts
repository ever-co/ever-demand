import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	ViewChildren,
	QueryList,
	Output,
	EventEmitter,
	OnDestroy,
} from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { MasonryComponent } from '@modules/masonry';
import { ProductComponent } from 'app/+products/product';
import { Subject } from 'rxjs';

@Component({
	selector: 'list-view',
	styleUrls: ['./list-view.component.scss'],
	templateUrl: './list-view.component.html',
})
export class ListViewComponent implements OnDestroy {
	@Input()
	products: ProductInfo[];
	@Input()
	productsLoading: boolean;
	@Input()
	isWideView: boolean;

	@ViewChild(MasonryComponent)
	masonry: MasonryComponent;

	containerWidth: string = '100px';
	productsCount: number = 10;

	@Output()
	loadProducts = new EventEmitter<number>();

	@ViewChildren(ProductComponent)
	private productsComponents: QueryList<ProductComponent>;

	private _ngDestroy$ = new Subject<void>();

	constructor(private readonly elRef: ElementRef) {
		this.elRef.nativeElement.ownerDocument.body.style.overflow = 'hidden';
	}

	onLayoutComplete(): void {
		this.elRef.nativeElement.ownerDocument.body.style.overflow = 'inherit';

		this.productsComponents.forEach((productComponent) =>
			productComponent.onLayoutComplete()
		);
	}

	onResize(event) {
		this.containerWidth = `${0.6 * event.target.innerWidth} px`;
	}

	ngOnDestroy() {
		this.elRef.nativeElement.ownerDocument.body.style.overflow = 'inherit';

		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
