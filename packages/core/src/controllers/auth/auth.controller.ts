import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('token/:id')
	async createToken(@Param('id') id: string): Promise<any> {
		return this.authService.createToken(id);
	}
}
