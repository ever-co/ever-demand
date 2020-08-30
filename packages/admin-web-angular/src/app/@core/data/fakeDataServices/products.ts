import { Injectable } from '@angular/core';
import { IProductCreateObject } from '@modules/server.common/interfaces/IProduct';
import faker from 'faker';
import _ from 'lodash';
import { IProductsCategory } from '@modules/server.common/interfaces/IProductsCategory';
import { images } from '@modules/server.common/data/image-urls';
import { productNames } from '@modules/server.common/data/food-product-names';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export default class FakeDataProducts {
	private locales = [];
	constructor(private translateService: TranslateService) {
		this.locales = this.translateService.getLangs();
	}

	async getRandomProduct(
		inputCategories: IProductsCategory[] = []
	): Promise<IProductCreateObject> {
		const images = await this._getRandomImages();

		return {
			title: [
				{
					locale: 'en-US',
					value: this._getRandomProductName(),
				},
				{
					locale: 'he-IL',
					value: 'רק איזה סוג של מוצר',
				},
			],
			description: [
				{
					locale: 'en-US',
					value: faker.lorem.sentence(24),
				},
			],
			details: [
				{
					locale: 'en-US',
					value: faker.lorem.sentence(),
				},
			],
			images,
			categories: inputCategories,
		};
	}

	async getPeperoniAndMushroomPizzaCreateObject(
		inputCategories: IProductsCategory[]
	): Promise<IProductCreateObject> {
		const imageElementUS = await this._getImageMeta(
			'https://res.cloudinary.com/evereq/image/upload/v1538675155/everbie-products-images/pizza_1_jwsppj.jpg'
		);

		const imageUS = {
			url: imageElementUS.src,
			orientation: this._getImageOrientation(imageElementUS),
			width: imageElementUS.width,
			height: imageElementUS.height,
		};

		const randomImages = await this._getRandomImages(['en-US']);

		const images = randomImages.concat([
			{
				locale: 'en-US',
				...imageUS,
			},
		]);

		return {
			title: [
				{
					locale: 'en-US',
					value: 'Pepperoni and mushrooms',
				},
				{
					locale: 'he-IL',
					value: 'פפרוני ופטריות',
				},
			],
			description: [
				{
					locale: 'en-US',
					value: 'Peperoni & Mushroom',
				},
			],
			details: [
				{
					locale: 'en-US',
					value: '100% tasty peperoni pizza',
				},
			],
			images,
			categories: inputCategories,
		};
	}

	async getSushiAndCaviarMixCreateObject(
		inputCategories: IProductsCategory[]
	): Promise<IProductCreateObject> {
		const imageElementUS = await this._getImageMeta(
			'https://res.cloudinary.com/evereq/image/upload/v1538675517/sushi_3_1000x1600_yfdxvp_f25npp.jpg'
		);

		const imageUS = {
			url: imageElementUS.src,
			orientation: this._getImageOrientation(imageElementUS),
			width: imageElementUS.width,
			height: imageElementUS.height,
		};

		const randomImages = await this._getRandomImages(['en-US']);

		const images = randomImages.concat([
			{
				locale: 'en-US',
				...imageUS,
			},
		]);

		return {
			title: [
				{
					locale: 'en-US',
					value: 'Sushi and caviar mix',
				},
				{
					locale: 'he-IL',
					value: 'מיקס סושי וקוויאר',
				},
			],
			description: [
				{
					locale: 'en-US',
					value: 'Sushi & Caviar mix',
				},
			],
			details: [
				{
					locale: 'en-US',
					value: 'Mix Caviar and sushi',
				},
			],
			images,
			categories: inputCategories,
		};
	}

	async getSushiMixCreateObject(
		inputCategories: IProductsCategory[]
	): Promise<IProductCreateObject> {
		const imageElementUS = await this._getImageMeta(
			'https://res.cloudinary.com/evereq/image/upload/v1538675517/sushi_o8gcsm_fxgdij.jpg'
		);

		const imageUS = {
			url: imageElementUS.src,
			orientation: this._getImageOrientation(imageElementUS),
			width: imageElementUS.width,
			height: imageElementUS.height,
		};

		const randomImages = await this._getRandomImages(['en-US']);

		const images = randomImages.concat([
			{
				locale: 'en-US',
				...imageUS,
			},
		]);

		return {
			title: [
				{
					locale: 'en-US',
					value: 'Mix of 23 sushi',
				},
				{
					locale: 'he-IL',
					value: 'מיקס של 23 סושי',
				},
			],
			description: [
				{
					locale: 'en-US',
					value: '23 Sushi Mix',
				},
			],
			details: [
				{
					locale: 'en-US',
					value: '23 tasty mix from sushi',
				},
			],
			images,
			categories: inputCategories,
		};
	}

	async getPastaCreateObject(
		inputCategories: IProductsCategory[]
	): Promise<IProductCreateObject> {
		const imageElementUS = await this._getImageMeta(
			'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
		);

		const imageElementIL = await this._getImageMeta(
			'https://images.pexels.com/photos/1373915/pexels-photo-1373915.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
		);

		const imageElementBG = await this._getImageMeta(
			'https://images.pexels.com/photos/983587/pexels-photo-983587.jpeg?auto=compress&cs=tinysrgb&h=350'
		);

		const imageElementRU = await this._getImageMeta(
			'https://images.pexels.com/photos/769969/pexels-photo-769969.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
		);

		const imageUS = {
			url: imageElementUS.src,
			orientation: this._getImageOrientation(imageElementUS),
			width: imageElementUS.width,
			height: imageElementUS.height,
		};

		const imageIL = {
			url: imageElementIL.src,
			orientation: this._getImageOrientation(imageElementIL),
			width: imageElementIL.width,
			height: imageElementIL.height,
		};

		const imageBG = {
			url: imageElementBG.src,
			orientation: this._getImageOrientation(imageElementBG),
			width: imageElementBG.width,
			height: imageElementBG.height,
		};

		const imageRU = {
			url: imageElementRU.src,
			orientation: this._getImageOrientation(imageElementRU),
			width: imageElementRU.width,
			height: imageElementRU.height,
		};

		const randomImages = await this._getRandomImages([
			'en-US',
			'he-IL',
			'ru-RU',
			'bg-BG',
		]);

		const images = randomImages.concat([
			{
				locale: 'en-US',
				...imageUS,
			},
			{
				locale: 'he-IL',
				...imageIL,
			},
			{
				locale: 'ru-RU',
				...imageRU,
			},
			{
				locale: 'bg-BG',
				...imageBG,
			},
		]);

		return {
			title: [
				{
					locale: 'en-US',
					value: 'Spiced pasta',
				},
				{
					locale: 'he-IL',
					value: 'פסטה מתובלת',
				},
			],
			description: [
				{
					locale: 'en-US',
					value: 'Seasoned Pasta',
				},
			],
			details: [
				{
					locale: 'en-US',
					value: 'Great seasoned pasta',
				},
			],
			images,
			categories: inputCategories,
		};
	}

	async getSushiBoxCreateObject(
		inputCategories: IProductsCategory[]
	): Promise<IProductCreateObject> {
		const imageElementUS = await this._getImageMeta(
			'https://res.cloudinary.com/evereq/image/upload/v1538675411/everbie-products-images/sushi_1_vdbljq.jpg'
		);

		const imageUS = {
			url: imageElementUS.src,
			orientation: this._getImageOrientation(imageElementUS),
			width: imageElementUS.width,
			height: imageElementUS.height,
		};

		const randomImages = await this._getRandomImages(['en-US']);

		const images = randomImages.concat([
			{
				locale: 'en-US',
				...imageUS,
			},
		]);

		return {
			title: [
				{
					locale: 'en-US',
					value: 'Sushi box',
				},
				{
					locale: 'he-IL',
					value: 'קופסת סושי',
				},
			],
			description: [
				{
					locale: 'en-US',
					value: 'Sushi box',
				},
			],
			details: [
				{
					locale: 'en-US',
					value: 'Sushi box',
				},
			],
			images,
			categories: inputCategories,
		};
	}

	async getPeperoniAndTomatoPizzaCreateObject(
		inputCategories: IProductsCategory[]
	): Promise<IProductCreateObject> {
		const imageElementUS = await this._getImageMeta(
			'https://res.cloudinary.com/evereq/image/upload/v1538675342/pizza_2_duoq0f_zahy7o.jpg'
		);

		const imageUS = {
			url: imageElementUS.src,
			orientation: this._getImageOrientation(imageElementUS),
			width: imageElementUS.width,
			height: imageElementUS.height,
		};

		const randomImages = await this._getRandomImages(['en-US']);

		const images = randomImages.concat([
			{
				locale: 'en-US',
				...imageUS,
			},
		]);

		return {
			title: [
				{
					locale: 'en-US',
					value: 'Pepperoni and tomatoes',
				},
				{
					locale: 'he-IL',
					value: 'פפרוני ועגבניות',
				},
			],
			description: [
				{
					locale: 'en-US',
					value: 'Peperoni & Tomato',
				},
			],
			details: [
				{
					locale: 'en-US',
					value:
						'100% muzzarella with tomato and pepperoni served with tomato souce by side.',
				},
			],
			images,
			categories: inputCategories,
		};
	}

	private async _getRandomImages(skipLocales = []) {
		const image = await this._getImage();
		return this.locales
			.filter((locale) => !skipLocales.includes(locale))
			.map((locale) => {
				return { locale, ...image };
			});
	}

	private async _getImage() {
		try {
			const url = images.food[_.random(0, images.food.length - 1)];

			const img: HTMLImageElement = await this._getImageMeta(url);

			const imgOrientation = this._getImageOrientation(img);

			return {
				url: img.src,
				orientation: imgOrientation,
				width: img.width,
				height: img.height,
			};
		} catch (error) {
			return error;
		}
	}

	private _getImageOrientation(image: HTMLImageElement) {
		return image.width === image.height
			? 0
			: image.width < image.height
			? 1
			: 2;
	}

	private _getImageMeta(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = url;
		});
	}

	private _getRandomProductName(): string {
		return productNames[_.random(0, productNames.length - 1)];
	}
}
