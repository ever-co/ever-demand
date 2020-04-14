import { Component, OnInit } from '@angular/core';
import { Store } from 'app/services/store.service';

@Component({
	selector: 'e-cu-elapsed-time',
	templateUrl: './elapsed-time.component.html',
	styleUrls: ['./elapsed-time.component.scss'],
})
export class ElapsedTimeComponent implements OnInit {
	public timePasssed: any = { timePassed: '00 : 00' };
	public timer: any;

	constructor(private store: Store) {}

	ngOnInit() {
		if (this.store.endOrderTime) {
			this.timePasssed = JSON.parse(this.store.endOrderTime);
		} else {
			this.timer = setInterval(this.updateTime, 1000, [this.timePasssed]);
		}
	}

	updateTime(comp: any) {
		const currDate = new Date();
		const startDate = new Date(
			JSON.parse(localStorage.getItem('startDate'))
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

			hoursPassed < 1
				? (hoursPassedStr = '')
				: (hoursPassedStr = hoursPassed.toString() + ' : ');

			minutesPassed < 10
				? (minutesPassedStr = '0' + minutesPassed)
				: (minutesPassedStr = minutesPassed.toString());

			secondsPassed < 10
				? (secondsPassedStr = '0' + secondsPassed)
				: (secondsPassedStr = secondsPassed.toString());

			comp[0].timePassed =
				hoursPassedStr + minutesPassedStr + ' : ' + secondsPassedStr;
		}
	}
}
