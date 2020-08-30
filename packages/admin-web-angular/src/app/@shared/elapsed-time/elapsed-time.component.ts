import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'ea-elapsed-time',
	templateUrl: './elapsed-time.component.html',
	styleUrls: ['./elapsed-time.component.scss'],
})
export class ElapsedTimeComponent implements OnInit {
	public timePasssed: any = { timePassed: '00 : 00' };
	public timer: any;

	constructor() {}

	ngOnInit() {
		if (this._getEndTime) {
			this.timePasssed = JSON.parse(this._getEndTime);
		} else {
			this.timer = setInterval(this.updateTime, 1000, [this.timePasssed]);
		}
	}

	updateTime(comp: any) {
		const currDate = new Date();

		const startDate = new Date(
			JSON.parse(localStorage.getItem('simulationStartDate'))
		);

		if (startDate) {
			let diff = (currDate.getTime() - startDate.getTime()) / 1000;

			const hoursPassed = Math.floor(diff / 3600);

			diff = diff - hoursPassed * 3600;

			const minutesPassed = Math.floor(diff / 60);

			const secondsPassed = Number(
				(diff - minutesPassed * 60).toFixed(0)
			);

			let minutesPassedStr = '';
			let secondsPassedStr = '';
			let hoursPassedStr = '';

			if (hoursPassed >= 1) {
				hoursPassedStr = hoursPassed.toString() + ' : ';
			}

			minutesPassedStr =
				minutesPassed < 10
					? '0' + minutesPassed
					: minutesPassed.toString();

			secondsPassedStr =
				secondsPassed < 10
					? '0' + secondsPassed
					: secondsPassed.toString();

			comp[0].timePassed =
				hoursPassedStr + minutesPassedStr + ' : ' + secondsPassedStr;
		}
	}

	private get _getEndTime() {
		return localStorage.getItem('simulationEndTime');
	}
}
