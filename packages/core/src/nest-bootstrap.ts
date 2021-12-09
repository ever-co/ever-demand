import chalk from 'chalk';
import { urlencoded, json } from 'express';
import { NestFactory, Reflector } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from './env';
import Logger from 'bunyan';
import { createEverLogger } from './helpers/Log';
import { EverbieNestJSLogger } from './helpers/NestJSLogger';
import { INestApplication } from '@nestjs/common';
// import { SentryService } from '@ntegral/nestjs-sentry';
import expressSession from 'express-session';
import helmet from 'helmet';

const log: Logger = createEverLogger({ name: 'bootstrapNest' });

declare const module: any;

export async function bootstrapNest(): Promise<void> {

	const app: INestApplication = await NestFactory.create(ApplicationModule, {
		logger: new EverbieNestJSLogger(),
	});

	// This will lock all routes and make them accessible by authenticated users only.
	const reflector = app.get(Reflector);
	// app.useGlobalGuards(new AuthGuard(reflector));

	// app.useLogger(app.get(SentryService));
	app.use(json({ limit: '50mb' }));
	app.use(urlencoded({ extended: true, limit: '50mb' }));

	app.enableCors({
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
		allowedHeaders:
			'Authorization, Language, Tenant-Id, X-Requested-With, X-Auth-Token, X-HTTP-Method-Override, Content-Type, Content-Language, Accept, Accept-Language, Observe'
	});

	// TODO: enable csurf
	// As explained on the csurf middleware page https://github.com/expressjs/csurf#csurf,
	// the csurf module requires either a session middleware or cookie-parser to be initialized first.
	// app.use(csurf());

	app.use(
		expressSession({
			secret: env.EXPRESS_SESSION_SECRET,
			resave: true,
			saveUninitialized: true
		})
	);

	app.use(helmet());
	const globalPrefix = 'api';
	app.setGlobalPrefix(globalPrefix);

	const options = new DocumentBuilder()
		.setTitle('Ever Demand REST API')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup('swg', app, document);

	const port: number = env.GQLPORT;
	let host: string = env.API_HOST;

	if (!host) {
		host = '0.0.0.0';
	}

	console.log(chalk.green(`Configured Host: ${host}`));
	console.log(chalk.green(`Configured Port: ${port}`));

	log.info(`Swagger UI available at http://${host}:${port}/swg`);
	console.log(chalk.green(`Swagger UI available at http://${host}:${port}/swg`));

	log.info(`REST API will be available at http://${host}:${port}/${globalPrefix}`);
	console.log(chalk.green(`REST API will be available at http://${host}:${port}/${globalPrefix}`));

	await app.listen(port, host, () => {
		console.log(chalk.magenta(`REST API Listening at http://${host}:${port}/${globalPrefix}`));
	});

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose((_) => app.close());
	}
}
