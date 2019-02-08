import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'myReplacePipe' })
export class ReplacePipe implements PipeTransform {
	transform(
		value: string,
		searchValue: string,
		replaceValue: string
	): string {
		if (
			typeof value !== typeof 'string' ||
			typeof searchValue !== typeof 'string' ||
			typeof replaceValue !== typeof 'string'
		) {
			throw Error('All pipe parameters should be strings!');
		}

		return value.replace(new RegExp(searchValue, 'g'), replaceValue);
	}
}
