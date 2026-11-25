/** Product helpers of the Ionic app: locale pick, discount, delivery badge, images. */
import { DeliveryType } from './enums';
import type { LocaleMember, ProductImage, WarehouseProduct } from './types';

type Translatable = Array<LocaleMember | ProductImage>;

/**
 * `ProductLocalesService.getTranslate`: the member whose locale starts with the current language,
 * else with the default language, else the first one. Images carry `url` instead of `value`.
 */
export function pickTranslation(
	members: Translatable | null | undefined,
	language: string,
	defaultLanguage = 'en-US',
): string {
	if (!members || members.length === 0) {
		return '';
	}
	const member =
		members.find((m) => m.locale?.startsWith(language)) ||
		members.find((m) => m.locale?.startsWith(defaultLanguage)) ||
		members[0];
	return ('value' in member && member.value) || ('url' in member && member.url) || '';
}

/** Shorten to `max` characters with `...` (the Ionic `shortenDescription`). */
export function shorten(text: string, max: number): string {
	if (!text) {
		return '';
	}
	return text.length < max ? text : `${text.substring(0, max - 3)}...`;
}

/** Discount in % (`floor((1 - price / initialPrice) * 100)`), 0 when there is none. */
export function discountPercent(product: Pick<WarehouseProduct, 'price' | 'initialPrice'> | null | undefined): number {
	if (!product || !product.initialPrice || product.price === product.initialPrice) {
		return 0;
	}
	return Math.floor((1 - product.price / product.initialPrice) * 100);
}

export interface DeliveryInfoTexts {
	minutes: string;
	readyFor: string;
	delivery: string;
	takeaway: string;
}

export interface DeliveryInfo {
	icon: 'flash' | 'moped';
	line1: string;
	line2: string;
}

/** The delivery badge on product cards (`e-cu-delivery-info`). */
export function deliveryInfo(
	product: Pick<WarehouseProduct, 'deliveryTimeMin' | 'deliveryTimeMax'> | null | undefined,
	deliveryType: DeliveryType,
	texts: DeliveryInfoTexts,
	defaults: { min: number; max: number },
): DeliveryInfo | null {
	if (!product) {
		return null;
	}
	const isTakeaway = deliveryType === DeliveryType.Takeaway;
	const { deliveryTimeMin: min, deliveryTimeMax: max } = product;
	const range =
		min != null && max != null
			? `${min}-${max} ${texts.minutes}`
			: `${defaults.min}-${defaults.max} ${texts.minutes}`;

	let line1: string;
	if (!isTakeaway) {
		line1 = range;
	} else if (max == null || max <= 15) {
		line1 = texts.readyFor;
	} else {
		line1 = range;
	}

	return {
		icon: isTakeaway ? 'flash' : 'moped',
		line1,
		line2: isTakeaway ? texts.takeaway : texts.delivery,
	};
}

export interface ProductImages {
	/** One image shown alone. */
	single: ProductImage | null;
	/** Images for the carousel. */
	carousel: ProductImage[];
}

/** Product details image rules (horizontal = `orientation === 2`). */
export function productDetailsImages(images: ProductImage[] | null | undefined): ProductImages {
	if (!images || images.length === 0) {
		return { single: null, carousel: [] };
	}
	if (images.length === 1) {
		return { single: images[0], carousel: [] };
	}
	const horizontal = images.filter((i) => i.orientation === 2);
	const vertical = images.filter((i) => i.orientation !== 2);

	if (vertical.length === horizontal.length && vertical.length === 1) {
		return { single: horizontal[0], carousel: [] };
	}
	if (vertical.length === 1) {
		return { single: null, carousel: horizontal };
	}
	if (horizontal.length === 1) {
		return { single: null, carousel: vertical };
	}
	return { single: null, carousel: vertical.length > 0 ? vertical : horizontal };
}

/** Order card image: the current language, else `en-US`. */
export function orderProductImage(images: ProductImage[], language: string): ProductImage | undefined {
	return images.find((i) => i.locale === language) || images.find((i) => i.locale === 'en-US') || images[0];
}
