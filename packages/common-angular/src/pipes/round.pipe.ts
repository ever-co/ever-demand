import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: false, name: 'ngxRound' })
export class RoundPipe implements PipeTransform {
	transform(input: number): number {
		return Math.round(input);
	}
}
