import { Module } from '@nestjs/common';
import { ProductResolver } from './product.resolver';
import { ProductsCategoriesModule } from './categories/products-categories.module';

@Module({
	imports: [ProductsCategoriesModule],
	providers: [ProductResolver],
})
export class ProductsModule {}
