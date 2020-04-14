import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from './env';
import Logger from 'bunyan';
import { createEverLogger } from './helpers/Log';
import { EverbieNestJSLogger } from './helpers/NestJSLogger';
import {
	SwaggerBaseConfig,
	SwaggerDocument,
} from '@nestjs/swagger/dist/interfaces';
import { INestApplication } from '@nestjs/common';

const log: Logger = createEverLogger({ name: 'bootstrapNest' });

declare const module: any;

export async function bootstrapNest(): Promise<void> {
	const port: number = env.GQLPORT;

	const app: INestApplication = await NestFactory.create(ApplicationModule, {
		logger: new EverbieNestJSLogger(),
	});

	app.enableCors();
	const options: SwaggerBaseConfig = new DocumentBuilder()
		.setTitle('Ever REST API')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	const document: SwaggerDocument = SwaggerModule.createDocument(
		app,
		options
	);

	SwaggerModule.setup('api', app, document);

	await app.listen(port + '');

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose((_) => app.close());
	}

	log.info(`Swagger UI available at http://localhost:${port}/api`);
	console.log(`Swagger UI available at http://localhost:${port}/api`);
}
