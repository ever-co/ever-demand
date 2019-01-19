import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { injectable, optional } from 'inversify';
import { routerName } from '@pyro/io';

@injectable()
@routerName('configService')
export class ConfigService {
	private readonly _envConfig: { [prop: string]: string };

	constructor(@optional() filePath: string = '.env') {
		this._envConfig = dotenv.parse(fs.readFileSync(filePath));
	}

	/**
	 * Get the environment variables by 'key' from '.env' file
	 * @param key This is name of the environemnt variable (HTTPPORT, HTTPSPORT...) etc.
	 * @returns Returns a value for taht key
	 */
	get(key: string): string {
		return this._envConfig[key];
	}
}
