import { addIcons } from 'ionicons';
import {
	bicycle,
	card,
	chevronDown,
	chevronUp,
	globe,
	informationCircleOutline,
	menu,
	newspaperOutline,
} from 'ionicons/icons';

/**
 * Every ionicon the templates use. The standalone <ion-icon> renders only registered icons
 * (it no longer loads `svg/<name>.svg` from the assets), so a new icon name goes here too.
 * `addIcons` also registers the kebab-case name (`chevronDown` -> `chevron-down`).
 */
export const APP_ICONS = {
	bicycle,
	card,
	chevronDown,
	chevronUp,
	globe,
	informationCircleOutline,
	menu,
	newspaperOutline,
};

export function registerAppIcons(): void {
	addIcons(APP_ICONS);
}
