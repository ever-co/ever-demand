import { TranslateLoader } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';

// A language file the app asked for. It arrives when the spec loads it.
export interface FileRequest {
	language: string;
	file: Subject<any>;
}

// Holds every language file until the spec loads it, so a spec picks the
// order in which the files arrive, as on a slow network.
export class ManualLoader implements TranslateLoader {
	readonly requests: FileRequest[] = [];

	getTranslation(language: string): Observable<any> {
		const file = new Subject<any>();
		this.requests.push({ language, file });
		return file;
	}
}

// Each file has one text, the name of its language, so a spec can read
// which file the customer sees.
export const load = (request: FileRequest) => {
	request.file.next({ LANGUAGE_NAME: request.language });
	request.file.complete();
};
