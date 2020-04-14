import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class SidenavService {
	public sidenavToggleRequests: BehaviorSubject<
		boolean
	> = new BehaviorSubject<boolean>(false);
	public isSidenavOpen: BehaviorSubject<boolean> = new BehaviorSubject<
		boolean
	>(false);
}
