import { ApiProperty } from '@nestjs/swagger';
import {
	IProductTitle,
	IProductDescription,
	IProductImage,
} from '@modules/server.common/interfaces/IProduct';

export class UpdateProductDto {
	@ApiProperty()
	readonly name?: string;

	@ApiProperty()
	readonly price?: number;
}

export class CreateProductDto {
	@ApiProperty()
	readonly title: IProductTitle[];

	@ApiProperty()
	readonly description: IProductDescription[];

	@ApiProperty()
	readonly images: IProductImage[];
}
