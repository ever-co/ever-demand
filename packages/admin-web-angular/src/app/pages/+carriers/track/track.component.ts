import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	templateUrl: './track.component.html',
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
