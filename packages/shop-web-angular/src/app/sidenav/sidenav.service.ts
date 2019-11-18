import { BehaviorSubject } from 'rxjs';

export class SidenavService {
	public sidenavToggleRequests: BehaviorSubject<
		boolean
	> = new BehaviorSubject<boolean>(false);
	public isSidenavOpen: BehaviorSubject<boolean> = new BehaviorSubject<
		boolean
	>(false);
}
