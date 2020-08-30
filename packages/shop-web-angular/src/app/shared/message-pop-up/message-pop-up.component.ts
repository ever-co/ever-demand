import { Component, Input, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'message-pop-up',
	styleUrls: ['./message-pop-up.component.scss'],
	templateUrl: './message-pop-up.component.html',
})
export class MessagePopUpComponent implements OnInit {
	public PREFIX: string = 'MESSAGE_POP_UP.';
	public confirmButton: string;
	public cancelButton: string;
	public modalTitle: string;
	public commonText: string;

	constructor(
		public dialogRef: MatDialogRef<MessagePopUpComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {
		this.initializeText();
	}

	initializeText() {
		this.modalTitle = this.PREFIX + this.data.modalTitle;
		this.commonText = this.PREFIX + this.data.commonText;
		this.cancelButton = this.PREFIX + this.data.cancelButton;
		this.confirmButton = this.PREFIX + this.data.confirmButton;
	}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
