import { addIcons } from 'ionicons';
import {
	add,
	alarm,
	call,
	car,
	cart,
	close,
	cloudUpload,
	globe,
	images,
	informationCircle,
	locate,
	logOut,
	mail,
	menu,
	newspaper,
	options,
	person,
	personAdd,
	removeCircle,
	settings,
} from 'ionicons/icons';

/**
 * Every ionicon the templates use. The standalone <ion-icon> renders only registered icons
 * (it no longer loads `svg/<name>.svg` from the assets), so a new icon name goes here too.
 * `addIcons` also registers the kebab-case name (`personAdd` -> `person-add`).
 * The `fa fa-*` Font Awesome icons are plain CSS and need nothing here; ionic-selectable
 * registers its own icons.
 */
export const APP_ICONS = {
	add,
	alarm,
	call,
	car,
	cart,
	close,
	// create/edit product type popups: `hasImage ? 'images' : 'cloud-upload'`
	cloudUpload,
	globe,
	images,
	informationCircle,
	locate,
	logOut,
	mail,
	menu,
	newspaper,
	options,
	person,
	personAdd,
	removeCircle,
	settings,
};

export function registerAppIcons(): void {
	addIcons(APP_ICONS);
}
