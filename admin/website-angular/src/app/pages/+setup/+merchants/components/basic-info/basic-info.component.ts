import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
	selector: 'ea-merchants-setup-basic-info',
	templateUrl: './basic-info.component.html',
	styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent {
	@ViewChild('basicInfoForm')
	basicInfoForm: NgForm;

	basicInfo = {
		name: ''
	};
}
