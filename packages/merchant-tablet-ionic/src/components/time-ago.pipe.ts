import { Pipe, PipeTransform } from '@angular/core';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 365 * 24 * 3600],
	['month', 30 * 24 * 3600],
	['day', 24 * 3600],
	['hour', 3600],
	['minute', 60],
];

/**
 * `{{ date | amTimeAgo }}` ("5 minutes ago"): the one ngx-moment pipe the app used, on the
 * built-in `Intl.RelativeTimeFormat`, so neither moment nor ngx-moment is needed any more.
 * Impure like the original, so the text keeps up with the clock.
 */
@Pipe({ name: 'amTimeAgo', pure: false, standalone: false })
export class TimeAgoPipe implements PipeTransform {
	private static readonly format = new Intl.RelativeTimeFormat('en', {
		numeric: 'auto',
	});

	static describe(value: Date | string | number, now = Date.now()): string {
		const time = new Date(value).getTime();
		if (value == null || Number.isNaN(time)) {
			return '';
		}
		const seconds = Math.round((time - now) / 1000);
		const abs = Math.abs(seconds);
		if (abs < 45) {
			return seconds <= 0 ? 'a few seconds ago' : 'in a few seconds';
		}
		for (const [unit, size] of UNITS) {
			if (abs >= size * 0.75 || unit === 'minute') {
				return TimeAgoPipe.format.format(Math.round(seconds / size), unit);
			}
		}
		return '';
	}

	transform(value: Date | string | number | null | undefined): string {
		return value == null ? '' : TimeAgoPipe.describe(value);
	}
}
