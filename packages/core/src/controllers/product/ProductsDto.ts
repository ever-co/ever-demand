import { ApiModelProperty } from '@nestjs/swagger';
import {
	IProductTitle,
	IProductDescription,
	IProductImage,
} from '@modules/server.common/interfaces/IProduct';

export class UpdateProductDto {
	@ApiModelProperty()
	readonly name?: string;

	@ApiModelProperty()
	readonly price?: number;
}

export class CreateProductDto {
	@ApiModelProperty()
	readonly title: IProductTitle[];

	@ApiModelProperty()
	readonly description: IProductDescription[];

	@ApiModelProperty()
	readonly images: IProductImage[];
}
