import { Controller, Get } from '@nestjs/common';
import { UserCommandService } from '../services/users';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('test')
@Controller('test')
export class TestController {
	constructor(private readonly _userCommandService: UserCommandService) {}

	@Get('index')
	async index() {
		const userId = '1';
		const deviceId = '2';
		const selectedLanguage = '3';

		await this._userCommandService.exec(userId, deviceId, selectedLanguage);
	}
}
