import { Module } from '@nestjs/common';
import { ProductsCategoryResolver } from './products-category.resolver';

@Module({
	providers: [ProductsCategoryResolver],
})
export class ProductsCategoriesModule {}
