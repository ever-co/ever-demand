import { inject, Injectable } from '@angular/core';
import { MediaTypeSelection } from '@capacitor/camera';
import { CAMERA } from './plugins';

export type PhotoSource = 'camera' | 'library';

/**
 * Takes or picks a photo through `@capacitor/camera` (replaces `@ionic-native/camera` +
 * `cordova-plugin-camera`) and returns it as a `File`, ready for the uploader.
 * Resolves `null` when the user cancels.
 */
@Injectable({ providedIn: 'root' })
export class PhotoService {
	private readonly camera = inject(CAMERA);

	async pick(source: PhotoSource): Promise<File | null> {
		try {
			const media =
				source === 'camera'
					? await this.camera.takePhoto({ quality: 50, correctOrientation: true })
					: (
							await this.camera.chooseFromGallery({
								mediaType: MediaTypeSelection.Photo,
								allowMultipleSelection: false,
								quality: 50,
							})
						).results[0];

			if (!media) {
				return null;
			}
			const url =
				media.webPath ||
				(media.thumbnail ? `data:image/jpeg;base64,${media.thumbnail}` : null);
			if (!url) {
				return null;
			}
			const blob = await (await fetch(url)).blob();
			return new File([blob], `${Date.now()}.jpg`, {
				type: blob.type || 'image/jpeg',
			});
		} catch (error) {
			// cancelled by the user, or no camera
			console.warn('No photo', error);
			return null;
		}
	}
}
