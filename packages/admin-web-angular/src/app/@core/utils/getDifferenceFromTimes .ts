export function getDifferenceFromTimes(time1: Date, time2: Date): string {
	let delta = Math.abs(time1.getTime() - time2.getTime()) / 1000;

	const days = Math.floor(delta / 86400);
	delta -= days * 86400;

	const hours = Math.floor(delta / 3600) % 24;
	delta -= hours * 3600;

	const minutes = Math.floor(delta / 60) % 60;
	delta -= minutes * 60;

	let seconds = delta % 60;
	seconds = Math.ceil(seconds);

	let h = '0' + hours;
	h = h.substr(-2);

	let min = '0' + minutes;
	min = min.substr(-2);

	let sec = '0' + seconds;
	sec = sec.substr(-2);

	if (days !== 0) {
		return `${days + ' days'}`;
	} else {
		return `${hours !== 0 ? hours + 'h ' : ''}${
			minutes !== 0 ? minutes + 'm ' : ''
		}${seconds !== 0 ? seconds + 's' : ''}`;
	}
}
