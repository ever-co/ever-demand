import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	standalone: false,
	templateUrl: './track.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./track.component.scss'],
})
export class TrackComponent implements OnInit {
	public carrierId: string;

	constructor(private readonly activeModal: NgbActiveModal) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	ngOnInit(): void {}
}
