import { APP_ICONS, registerIcons } from './icons';

// Every <ion-icon name="..."> in the templates (menu, invite by code, order
// card, products header). A name missing here renders an empty icon and logs
// "[Ionicons Warning]: Could not load icon".
const TEMPLATE_ICON_NAMES = [
	'basket',
	'call',
	'cart',
	'chevron-down',
	'globe',
	'hand-left',
	'help-circle',
	'information-circle',
	'list',
	'lock-closed',
	'logo-facebook',
	'logo-google',
	'search',
];

describe('registerIcons', () => {
	it('registers every icon name the templates use, in kebab case', () => {
		registerIcons();

		const registered: Map<string, string> = (window as any).Ionicons.map;
		for (const name of TEMPLATE_ICON_NAMES) {
			expect(registered.get(name), name).toMatch(
				/^data:image\/svg\+xml/,
			);
		}
	});

	it('registers nothing the templates do not use', () => {
		const kebab = Object.keys(APP_ICONS).map((key) =>
			key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
		);
		expect(kebab.sort()).toEqual([...TEMPLATE_ICON_NAMES].sort());
	});
});
