import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IconAlreadyRegisteredError } from './icon-already-registered.error';

@Injectable()
export class IconsService {
	public static namespace = 'ever';

	private registeredIcons = new Set();

	constructor(
		private readonly iconRegistry: MatIconRegistry,
		private readonly sanitizer: DomSanitizer
	) {}

	ensureRegistered(icon: string) {
		if (this.isRegistered(icon)) {
			return;
		}

		this.register(icon);
	}

	register(icon: string) {
		if (this.isRegistered(icon)) {
			throw new IconAlreadyRegisteredError();
		}

		this.iconRegistry.addSvgIconInNamespace(
			'ever',
			icon,
			this.sanitizer.bypassSecurityTrustResourceUrl(`icons/${icon}.svg`)
		);

		this.registeredIcons.add(icon);
	}

	isRegistered(icon: string): boolean {
		return this.registeredIcons.has(icon);
	}
}
