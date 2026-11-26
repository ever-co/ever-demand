import { addIcons } from 'ionicons';
import {
	basket,
	call,
	cart,
	chevronDown,
	globe,
	handLeft,
	helpCircle,
	informationCircle,
	list,
	lockClosed,
	logoFacebook,
	logoGoogle,
	search,
} from 'ionicons/icons';

/**
 * Every icon the templates name in `<ion-icon name="...">`. The standalone
 * `ion-icon` only renders registered icons (the NgModule build fetched
 * `/svg/<name>.svg` at runtime). `addIcons` also registers the kebab-case
 * name, so `handLeft` serves `name="hand-left"`. Add new names here.
 */
export const APP_ICONS: Record<string, string> = {
	basket,
	call,
	cart,
	chevronDown,
	globe,
	handLeft,
	helpCircle,
	informationCircle,
	list,
	lockClosed,
	logoFacebook,
	logoGoogle,
	search,
};

export function registerIcons(): void {
	addIcons(APP_ICONS);
}
