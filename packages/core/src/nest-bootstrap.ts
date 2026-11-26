import { styleText } from 'node:util';
import { urlencoded, json } from 'express';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from './env';
import Logger from 'bunyan';
import { createEverLogger } from './helpers/Log';
import { EverbieNestJSLogger } from './helpers/NestJSLogger';
import { INestApplication } from '@nestjs/common';
// import { SentryService } from '@ntegral/nestjs-sentry';
import { createSessionMiddleware } from './helpers/session-middleware';
import helmet from 'helmet';
import { tenantHttpMiddleware } from './tenant/tenant-http.middleware';

const log: Logger = createEverLogger({ name: 'bootstrapNest' });

export async function bootstrapNest(): Promise<INestApplication> {

	const app: INestApplication = await NestFactory.create(ApplicationModule, {
		logger: new EverbieNestJSLogger(),
	});

	// This will lock all routes and make them accessible by authenticated users only.
	// app.useGlobalGuards(new AuthGuard(app.get(Reflector)));

	// app.useLogger(app.get(SentryService));
	app.use(
		json({
			limit: '50mb',
			// the Stripe billing webhook verifies its signature on the raw body
			verify: (req: any, _res, buf) => {
				if (req.originalUrl?.startsWith('/api/billing/webhook')) {
					req.rawBody = buf;
				}
			},
		})
	);
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

	// The middleware always uses `saveUninitialized: false`: nothing in the app reads
	// `req.session` (auth is Passport/JWT), so a session is only stored once something
	// writes to it; otherwise every cookieless request would leak an entry in the
	// in-memory store. Health probes (/api/health, /api/health/ready) never get a session.
	app.use(
		createSessionMiddleware({
			secret: env.EXPRESS_SESSION_SECRET,
			resave: true
		})
	);

	// The GraphiQL landing page (GET /graphql) loads its scripts from a CDN,
	// which the default Content-Security-Policy refuses: no CSP there, the
	// other helmet headers everywhere.
	const securityHeaders = helmet();
	const securityHeadersWithoutCsp = helmet({ contentSecurityPolicy: false });
	app.use((req, res, next) =>
		(req.path === '/graphql' ? securityHeadersWithoutCsp : securityHeaders)(
			req,
			res,
			next
		)
	);
	if (env.TRUST_PROXY) {
		const trust = /^\d+$/.test(env.TRUST_PROXY) ? Number(env.TRUST_PROXY) : env.TRUST_PROXY;
		app.getHttpAdapter().getInstance().set('trust proxy', trust);
	}

	// Every request runs in the context of its tenant (login token, Tenant-Id
	// header or tenant host). Mounted after the body parsers above, before
	// GraphQL and the controllers.
	app.use(tenantHttpMiddleware);

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

	console.log(styleText('green', `Configured Host: ${host}`));
	console.log(styleText('green', `Configured Port: ${port}`));

	log.info(`Swagger UI available at http://${host}:${port}/swg`);
	console.log(styleText('green', `Swagger UI available at http://${host}:${port}/swg`));

	log.info(`REST API will be available at http://${host}:${port}/${globalPrefix}`);
	console.log(styleText('green', `REST API will be available at http://${host}:${port}/${globalPrefix}`));

	await app.listen(port, host);

	console.log(
		styleText('magenta', `REST API Listening at http://${host}:${port}/${globalPrefix}`)
	);

	return app;
}
