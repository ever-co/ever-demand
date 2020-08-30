import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of as observableOf } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { NbLayoutDirection, NbLayoutDirectionService } from '@nebular/theme';

@Injectable()
export class StateService implements OnDestroy {
	constructor(directionService: NbLayoutDirectionService) {
		directionService
			.onDirectionChange()
			.pipe(takeWhile(() => this.alive))
			.subscribe((direction) => this.updateSidebarIcons(direction));

		this.updateSidebarIcons(directionService.getDirection());
	}

	protected layouts: any = [
		{
			name: 'One Column',
			icon: 'nb-layout-default',
			id: 'one-column',
			selected: true,
		},
		{
			name: 'Two Column',
			icon: 'nb-layout-two-column',
			id: 'two-column',
		},
		{
			name: 'Center Column',
			icon: 'nb-layout-centre',
			id: 'center-column',
		},
	];

	protected sidebars: any = [
		{
			name: 'Sidebar at layout start',
			icon: 'nb-layout-sidebar-left',
			id: 'start',
			selected: true,
		},
		{
			name: 'Sidebar at layout end',
			icon: 'nb-layout-sidebar-right',
			id: 'end',
		},
	];

	protected layoutState$ = new BehaviorSubject(this.layouts[0]);
	protected sidebarState$ = new BehaviorSubject(this.sidebars[0]);

	alive = true;

	ngOnDestroy() {
		this.alive = false;
	}

	setLayoutState(state: any): any {
		this.layoutState$.next(state);
	}

	getLayoutStates(): Observable<any[]> {
		return observableOf(this.layouts);
	}

	onLayoutState(): Observable<any> {
		return this.layoutState$.asObservable();
	}

	setSidebarState(state: any): any {
		this.sidebarState$.next(state);
	}

	getSidebarStates(): Observable<any[]> {
		return observableOf(this.sidebars);
	}

	onSidebarState(): Observable<any> {
		return this.sidebarState$.asObservable();
	}

	private updateSidebarIcons(direction: NbLayoutDirection) {
		const [startSidebar, endSidebar] = this.sidebars;
		const isLtr = direction === NbLayoutDirection.LTR;
		const startIconClass = isLtr
			? 'nb-layout-sidebar-left'
			: 'nb-layout-sidebar-right';
		const endIconClass = isLtr
			? 'nb-layout-sidebar-right'
			: 'nb-layout-sidebar-left';
		startSidebar.icon = startIconClass;
		endSidebar.icon = endIconClass;
	}
}
