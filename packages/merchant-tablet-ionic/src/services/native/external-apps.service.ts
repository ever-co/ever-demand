import { inject, Injectable } from '@angular/core';
import { APP_LAUNCHER, IS_NATIVE_PLATFORM, OPEN_EXTERNAL_URL } from './plugins';

export interface EmailDraft {
	to: string | string[];
	cc?: string | string[];
	subject?: string;
	body?: string;
}

/**
 * Phone calls and e-mails through `tel:` and `mailto:` links. Inside the native app they go
 * through `@capacitor/app-launcher`; this replaces `call-number` and
 * `cordova-plugin-email-composer`.
 */
@Injectable({ providedIn: 'root' })
export class ExternalAppsService {
	private readonly isNative = inject(IS_NATIVE_PLATFORM);
	private readonly launcher = inject(APP_LAUNCHER);
	private readonly openInBrowser = inject(OPEN_EXTERNAL_URL);

	static telUrl(phone: string): string {
		return `tel:${String(phone).replace(/[^\d+*#]/g, '')}`;
	}

	static mailtoUrl(draft: EmailDraft): string {
		const list = (v?: string | string[]) => ([] as string[]).concat(v ?? []).join(',');
		const params = new URLSearchParams();
		if (draft.cc) params.set('cc', list(draft.cc));
		if (draft.subject) params.set('subject', draft.subject);
		if (draft.body) params.set('body', draft.body);
		const query = params.toString().replace(/\+/g, '%20');
		return `mailto:${list(draft.to)}${query ? `?${query}` : ''}`;
	}

	call(phone: string): Promise<void> {
		return this.open(ExternalAppsService.telUrl(phone));
	}

	email(draft: EmailDraft): Promise<void> {
		return this.open(ExternalAppsService.mailtoUrl(draft));
	}

	private async open(url: string): Promise<void> {
		if (this.isNative) {
			await this.launcher.openUrl({ url });
		} else {
			this.openInBrowser(url);
		}
	}
}
