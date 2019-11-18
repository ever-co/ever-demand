import { Controller, Get } from '@nestjs/common';
import { UserCommandService } from '../services/users';
import { ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('test')
@Controller('test')
export class TestController {
	constructor(private readonly _userCommandService: UserCommandService) {}

	@Get('index')
	async index() {
		const userId = '1';
		const deviceId = '2';

		await this._userCommandService.exec(userId, deviceId);
	}
}
