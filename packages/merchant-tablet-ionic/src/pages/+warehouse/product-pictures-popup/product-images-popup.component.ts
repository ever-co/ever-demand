import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IProductImage } from '@modules/server.common/interfaces/IProduct';

@Component({
	selector: 'product-images-popup',
	templateUrl: 'product-images-popup.component.html',
	styleUrls: ['./product-images-popu.component.scss'],
})
export class ProductImagesPopup {
	@Input()
	images: IProductImage[] = [];

	constructor(private modalCtrl: ModalController) {}

	get imagesUrls() {
		return this.images ? this.images.map((i) => i.url).join(' ') : '';
	}

	get imagesArr() {
		if (this.imagesUrls) {
			const imagesStr = this.imagesUrls;

			let imageUrls = imagesStr.split(/\s+/);
			imageUrls = imageUrls.filter((a) => a.trim() !== '');

			return imageUrls;
		}

		return [];
	}

	deleteImg(imageUrl) {
		this.images = this.images.filter((i) => i.url !== imageUrl);
	}

	addImageObj(imgData: IProductImage) {
		this.images.push(imgData);
	}

	saveImages() {
		this.modalCtrl.dismiss(this.images);
	}

	cancelModal() {
		this.modalCtrl.dismiss();
	}
}
