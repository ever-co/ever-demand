import {
	Component,
	EventEmitter,
	Input,
	Output,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	styles: [
		`
			.order-comment-wrapper textarea {
				width: 100%;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<div class="order-comment-wrapper">
			<textarea (blur)="setComment($event)"></textarea>
		</div>
	`,
})
export class MakeOrderCommentComponent implements ViewCell {
	@Input()
	value;
	@Input()
	rowData: any;

	@Output()
	comment = new EventEmitter<string>();

	get productId(): string {
		return this.value.productId;
	}

	setComment(e) {
		this.comment.emit(e.target.value);
	}
}
