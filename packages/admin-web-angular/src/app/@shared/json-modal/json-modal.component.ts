import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	styleUrls: ['./json-modal.component.scss'],
	templateUrl: './json-modal.component.html',
})
export class JsonModalComponent implements OnInit {
	public obj: {};
	public title: string;
	public subTitle: string;

	constructor(private readonly activeModal: NgbActiveModal) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	ngOnInit(): void {}
}
