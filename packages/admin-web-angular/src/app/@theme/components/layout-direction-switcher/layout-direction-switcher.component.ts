import {
	Component,
	Input,
	OnDestroy,
	ChangeDetectionStrategy,
} from '@angular/core';
import { NbLayoutDirection, NbLayoutDirectionService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';

@Component({
	standalone: false,
	selector: 'ngx-layout-direction-switcher',
	changeDetection: ChangeDetectionStrategy.Eager,
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
				(newDirection) => (this.currentDirection = newDirection),
			);
	}

	toggleDirection(newDirection) {
		this.directionService.setDirection(newDirection);
	}

	ngOnDestroy() {
		this.alive = false;
	}
}
