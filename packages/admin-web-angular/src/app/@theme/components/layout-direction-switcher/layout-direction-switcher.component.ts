import { Component, Input, OnDestroy } from '@angular/core';
import { NbLayoutDirection, NbLayoutDirectionService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators/takeWhile';

@Component({
	selector: 'ngx-layout-direction-switcher',
	templateUrl: './layout-direction-switcher.component.html',
})
export class LayoutDirectionSwitcherComponent implements OnDestroy {
	directions = NbLayoutDirection;
	currentDirection: NbLayoutDirection;
	alive = true;

	@Input() vertical: boolean = false;

	constructor(private directionService: NbLayoutDirectionService) {
		this.currentDirection = this.directionService.getDirection();

		this.directionService
			.onDirectionChange()
			.pipe(takeWhile(() => this.alive))
			.subscribe(
				(newDirection) => (this.currentDirection = newDirection)
			);
	}

	toggleDirection(newDirection) {
		this.directionService.setDirection(newDirection);
	}

	ngOnDestroy() {
		this.alive = false;
	}
}
