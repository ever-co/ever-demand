import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'myNumberWithCommas' })
export class NumberWithCommasPipe implements PipeTransform {
	transform(input: number): string {
		return new Intl.NumberFormat().format(input);
	}
}
