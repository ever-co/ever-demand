import { Injectable } from '@angular/core';
import { images } from '@modules/server.common/data/image-urls';

@Injectable()
export default class FakeDataProductsCategories {
	private static readonly locales = {
		en: 'en-US',
		bg: 'bg-BG',
		he: 'he-IL',
		ru: 'ru-RU',
	};

	getDifferentKindsOfCategories() {
		return {
			salads: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Salads',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Салати',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'סלטים',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Салаты',
					},
				],
				image: images.productCategories.salads,
			},
			dessert: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Desserts',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Десерти',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'קינוחים',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Десерты',
					},
				],
				image: images.productCategories.dessert,
			},
			drinks: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Drinks',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Напитки',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'מַשׁקָאוֹת',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Напитки',
					},
				],
				image: images.productCategories.drinks,
			},
			meatDishes: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Meat Dishes',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Месни Ястия',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'כלי אוכל',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Мясные Блюда',
					},
				],
				image: images.productCategories.meat,
			},
			soups: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Soups',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Супи',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'מרקים',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Супы',
					},
				],
				image: images.productCategories.soups,
			},
			alcohol: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Alcohol',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Алкохол',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'כּוֹהֶל',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Алкоголь',
					},
				],
				image: images.productCategories.alcohol,
			},
			pizza: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Pizza',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Пица',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'פיצה',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Пицца',
					},
				],
				image: images.productCategories.pizza,
			},
			fastFood: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Fast Food',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Бърза Храна',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'אוכל מהיר',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Быстрое Питание',
					},
				],
				image: images.productCategories.fastFood,
			},
			burger: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Burger',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Бургер',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'בורגר',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Бутерброд',
					},
				],
				image: images.productCategories.burger,
			},
			sushi: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Sushi',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Суши',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'סושי',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Суши',
					},
				],
				image: images.productCategories.sushi,
			},
			pasta: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Pasta',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Тестени Изделия',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'פיצה קטגוריות',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Макаронные Изделия',
					},
				],
				image: images.productCategories.pasta,
			},
			vegetarian: {
				name: [
					{
						locale: FakeDataProductsCategories.locales.en,
						value: 'Vegetarian',
					},
					{
						locale: FakeDataProductsCategories.locales.bg,
						value: 'Вегетариански',
					},
					{
						locale: FakeDataProductsCategories.locales.he,
						value: 'צמחוני',
					},
					{
						locale: FakeDataProductsCategories.locales.ru,
						value: 'Вегетарианец',
					},
				],
				image: images.productCategories.vegetarian,
			},
		};
	}
}
