import {
	Body,
	Controller,
	Delete,
	Get,
	Header,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiUseTags } from '@nestjs/swagger';
import { CreateProductDto, UpdateProductDto } from './ProductsDto';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from '../../services/products';

@ApiUseTags('product')
@Controller('product')
export class ProductController {
	constructor(private productsService: ProductsService) {}

	@Get()
	@Header('Cache-Control', 'none')
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	findAll(@Req() request) {
		return this.productsService.find({});
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		const prod = await this.productsService.getCurrent(id);
		return prod;
	}

	@Post(':id')
	async create(@Body() createInfo: CreateProductDto) {
		return this.productsService.create(createInfo);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() updateInfo: UpdateProductDto) {
		return `Here updates a #${id} product`;
	}

	@Delete('id')
	remove(@Param('id') id: string) {
		return `Here removes a #${id} product`;
	}
}
