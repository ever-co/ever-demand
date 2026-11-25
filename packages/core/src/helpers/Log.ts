import Logger from 'bunyan';
import { existsSync, mkdirSync } from 'fs';
import { env } from '../env';
import _ = require('lodash');
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { CloudWatchStream } from './cloudwatch-stream';
import os from 'os';
import PrettyStream from 'bunyan-prettystream';

export interface LogArgs {
	// which file used to store logs
	name: string;
}

let isLogsFolderExists = env.LOGS_PATH ? existsSync(env.LOGS_PATH) : false;

// one client for all CloudWatch streams (created on the first production logger)
let cloudWatchClient: CloudWatchLogsClient | undefined;

const getAdditionalLoggerStreams = ({ name }: LogArgs): Logger.Stream[] => {
	const hostname = os.hostname();

	if (env.isProd) {
		const logLevels: Logger.LogLevel[] = ['info', 'error', 'debug'];

		return _.map(logLevels, (type) => {
			let stream: any;

			try {
				cloudWatchClient ??= new CloudWatchLogsClient({
					region: 'us-east-1',
				});

				stream = new CloudWatchStream({
					logGroupName: 'ever/api',
					logStreamName: `${type}_${name}_${hostname}`,
					client: cloudWatchClient,
				});
			} catch (err) {
				console.log(err);
			}

			return {
				stream,
				type: 'raw',
				level: type,
			};
		});
	} else {
		return [];
	}
};

const prettyStdOut = new PrettyStream();

prettyStdOut.pipe(process.stdout);

export function createEverLogger({ name }: LogArgs): Logger {
	if (!isLogsFolderExists) {
		mkdirSync(env.LOGS_PATH, { recursive: true });
		isLogsFolderExists = true;
	}

	const logger = Logger.createLogger({
		name: `everbie.${name}`,
		serializers: Logger.stdSerializers,
		streams: [
			{
				level: 'info',
				path: `${env.LOGS_PATH}/info_${name}.log`,
			},
			{
				level: 'error',
				path: `${env.LOGS_PATH}/error_${name}.log`,
			},
			{
				level: 'debug',
				path: `${env.LOGS_PATH}/debug_${name}.log`,
			},
			{
				level: 'debug',
				type: 'raw',
				stream: prettyStdOut,
			},
			...getAdditionalLoggerStreams({ name }),
		],
	});

	if (env.LOG_LEVEL) {
		logger.level(Logger[env.LOG_LEVEL.toUpperCase()]);
	}

	return logger;
}

export function Log(logArgs: LogArgs): ClassDecorator {
	return function (target) {
		target.prototype.logName = logArgs.name;
		target.prototype.log = createEverLogger(logArgs);
	};
}
