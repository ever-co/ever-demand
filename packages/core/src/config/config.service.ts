import { injectable } from 'inversify';
import { routerName } from '@pyro/io';
import { env, Environments, Env } from '../env';

@injectable()
@routerName('configService')
export class ConfigService {
	/**
	 * Get the config setting.
	 * In many cases, it get's environment variables by 'key' from '.env' file
	 * @param key This is settings name or the environemnt variable (HTTPPORT, HTTPSPORT...) etc.
	 * @returns Returns a value for the given settings key
	 */
	get(key: string): string | number | boolean | Environments {
		return env[key];
	}

	/**
	 * Get All Env settings
	 */
	get Env(): Env {
		return env;
	}
}
