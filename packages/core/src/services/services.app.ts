import fs from 'fs';
import { inject, injectable, multiInject } from 'inversify';
import https from 'https';
import http from 'http';
import path from 'path';
import pem from 'pem';
import cors from 'cors';
import passport from 'passport';
import methodOverride from 'method-override';
import errorhandler from 'errorhandler';
import { Server as SocketIOServer } from 'socket.io';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { create as createHandlebars } from 'express-handlebars';
import { createEverLogger } from '../helpers/Log';
import IService, { ServiceSymbol } from './IService';
import { IRoutersManager } from '@pyro/io';
import { WarehousesService } from './warehouses';
import { SocialStrategiesService } from './users';
import { env } from '../env';
import { getModel } from '@pyro/db-server';
import { AdminsService } from './admins';
import ipstack = require('ipstack');
import requestIp = require('request-ip');
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import { getDummyImage } from '@modules/server.common/utils';
import { ConfigService } from '../config/config.service';
import { firstAdminPassword } from './admins/firstAdminPassword';
import { syncSuperAdmin } from './admins/super-admin';
import { stripProtectedFields } from './stripProtectedFields';
import {
	getTypeORMEntities,
	initTypeORMDataSource,
	dbTlsOptions,
} from '../helpers/typeorm';
import { runMigrations } from '../migrations/run-migrations';
import { TenantContext } from '../tenant/tenant-context';
import { tenantDirectory } from '../tenant/tenant-directory';
import { tenantHttpMiddleware } from '../tenant/tenant-http.middleware';
import { getModel as getTenantModel } from '@pyro/db-server/model';
import Tenant from '@modules/server.common/entities/Tenant';

require('dotenv').config({ quiet: true });

// local IPs
const INTERNAL_IPS = ['127.0.0.1', '::1'];

@injectable()
export class ServicesApp {
	protected db_server = process.env.DB_ENV || 'primary';

	protected db: mongoose.Connection;

	protected expressApp: express.Express;
	protected httpsServer: https.Server;
	protected httpServer: http.Server;

	private log = createEverLogger({ name: 'main' });

	// TODO: put to config (we also may want to increase it)
	private static _poolSize: number = 50;

	// TODO: put to config
	private static _connectTimeoutMS: number = 40000;

	private callback: () => void;

	constructor(
		@multiInject(ServiceSymbol)
		protected services: IService[],
		@inject('RoutersManager')
		protected routersManager: IRoutersManager,
		@inject(WarehousesService)
		protected warehousesService: WarehousesService,
		@inject(SocialStrategiesService)
		protected socialStrategiesService: SocialStrategiesService,
		@inject(AdminsService)
		private readonly _adminsService: AdminsService,
		@inject(ConfigService)
		_configService: ConfigService
	) {
		const maxSockets = _configService.Env.MAX_SOCKETS;

		// see https://webapplog.com/seven-things-you-should-stop-doing-with-node-js
		http.globalAgent.maxSockets = maxSockets;
		https.globalAgent.maxSockets = maxSockets;

		// If the Node process ends, close the Mongoose connection
		process
			.on('SIGINT', this._gracefulExit)
			.on('SIGTERM', this._gracefulExit);
	}

	async start(callback: () => void) {
		this.callback = callback;
		await this._connectDB();
	}

	static getEntities() {
		return getTypeORMEntities();
	}

	/**
	 * Creates the TypeORM connection our repositories use (see
	 * helpers/typeorm.ts). NestJS creates its own one in app.module.ts.
	 */
	static async CreateTypeORMConnection() {
		console.log('Creating TypeORM Connection...');

		const typeORMLog = createEverLogger({ name: 'TypeORM' });

		const dataSource = await initTypeORMDataSource();

		console.log(
			`TypeORM DB connection created. DB connected: ${dataSource.isInitialized}`
		);

		typeORMLog.info(
			`TypeORM DB connection created. DB connected: ${dataSource.isInitialized}`
		);

		return dataSource;
	}

	private _gracefulExit = async () => {
		try {
			if (this.db != null) {
				await this.db.close();
				this.log.info(
					'Mongoose default connection with DB :' +
						this.db_server +
						' is disconnected through app termination'
				);
			}
		} catch (err) {
			// exit anyway
		}
		process.exit(0);
	};

	private async _connectDB() {
		try {

			// DB_SSL_MODE / DB_CA_CERT, else whatever DB_URI says (helpers/typeorm.ts)
			const tlsOptions = dbTlsOptions();

			if (tlsOptions.tlsCAFile) {
				console.log(
					`Using temp SSL Cert Path: ${tlsOptions.tlsCAFile}`,
				);
			}

			const connectionOptions: mongoose.ConnectOptions = {
				...tlsOptions,
				user: process.env.DB_USER,
          		pass: process.env.DB_PASS,
          		dbName: process.env.DB_NAME || 'ever_development',
				connectTimeoutMS: ServicesApp._connectTimeoutMS,
				appName: 'ever_demand'
			};

			const mongoConnect: mongoose.Mongoose = await mongoose.connect(
				env.DB_URI,
				connectionOptions
			);

			this.db = mongoConnect.connection;

			this._configDBEvents();

			this._onDBConnect();
		} catch (err) {
			this.log.error(
				err,
				'Sever initialization failed! Cannot connect to DB'
			);
		}
	}

	private _configDBEvents() {
		this.db.on('error', (err) => this.log.error(err));

		this.db.on('disconnected', () => {
			this.log.warn(
				'Mongoose default connection to DB :' +
					this.db_server +
					' disconnected'
			);
		});

		this.db.on('connected', () => {
			this.log.info(
				'Mongoose default connection to DB :' +
					this.db_server +
					' connected'
			);
		});
	}

	private async _onDBConnect() {
		// that's important to see even if logs disabled, do not remove!
		console.log('Connected to DB');

		this.log.info({ db: this.db_server }, 'Connected to DB');

		// Before the models compile (they create their indexes then): records
		// without a tenant go to the default tenant, old unique indexes become
		// per-tenant ones.
		const { defaultTenantId } = await runMigrations(this.db, (message) => {
			console.log(`Migration: ${message}`);
			this.log.info(message);
		});

		tenantDirectory.setDefaultTenantId(defaultTenantId);

		if (!env.MULTI_TENANT) {
			// single-tenant install: whatever runs without a tenant runs in the default one
			TenantContext.setFallbackTenantId(defaultTenantId);
		}

		console.log(
			`Tenancy: ${env.MULTI_TENANT ? 'multi-tenant' : 'single-tenant'}, default tenant ${defaultTenantId}`,
		);

		await this._registerModels();
		await TenantContext.runInTenant(defaultTenantId, () =>
			this._registerEntityAdministrator(defaultTenantId),
		);
		await syncSuperAdmin(this.log);
		this._passportSetup();
		await this._startExpress();
		await this._startSocketIO();

		// execute callback defined at main.ts
		await this.callback();

		// let's report RAM usage after all is bootstrapped
		await this.reportMemoryUsage();
	}

	private async reportMemoryUsage() {
		console.log('Memory usage: ');
		console.log(process.memoryUsage());
	}

	/**
	 * Create initial (default) Admin user with default credentials:
	 * Email: admin@ever.co
	 * Password: admin
	 *
	 * @private
	 * @memberof ServicesApp
	 */
	private async _registerEntityAdministrator(defaultTenantId: string) {
		const adminEmail = env.ADMIN_EMAIL;
		const adminPassword = firstAdminPassword(env, process.env.DEMO === 'true');

		// admin emails are unique across tenants
		const adminCollectionCount = await TenantContext.runAsSystem(
			'is the first admin email taken in any tenant',
			() =>
				this._adminsService.count({
					email: adminEmail,
				})
		);

		if (adminCollectionCount === 0) {
			if (!adminPassword) {
				this.log.error(
					`No admin "${adminEmail}" exists yet and ADMIN_PASSWORD is not set: set ADMIN_PASSWORD to create the first admin (production has no default password).`
				);
				return;
			}
			// owner of the default tenant; platform super-admin only by
			// SUPER_ADMIN_EMAIL (syncSuperAdmin), never by being the first admin
			const admin = await this._adminsService.register(
				{
					admin: {
						email: adminEmail,
						name: 'Admin',
						hash: null,
						pictureUrl: getDummyImage(300, 300, 'A'),
					},
					password: adminPassword,
				},
				{ role: 'owner', isSuperAdmin: false },
			);

			await (getTenantModel(Tenant) as any)
				.updateOne(
					{ _id: defaultTenantId, ownerId: { $exists: false } },
					{ $set: { ownerId: admin.id } },
				)
				.exec();
			tenantDirectory.invalidate({ id: defaultTenantId });
		}
	}

	private _getBaseUrl(url: string) {
		if (url) {
			return url.slice(0, url.lastIndexOf('/') + 1).toString();
		}
	}

	private _passportSetup() {
		passport.serializeUser((user, done) => {
			done(null, user);
		});

		passport.deserializeUser((id, done) => {
			// TODO ?
		});

		// Google Strategy
		const googleStrategy = this.socialStrategiesService.getGoogleStrategy();
		if (googleStrategy != null) {
			passport.use(googleStrategy);
		}

		// Facebook Strategy
		const facebookStrategy = this.socialStrategiesService.getFacebookStrategy();
		if (facebookStrategy != null) {
			passport.use(facebookStrategy);
		}
	}

	private async _registerModels() {
		await Promise.all(this.services.map(async (service) => {
			const obj = (service as any).DBObject;

			if (obj != null) {
				console.log('Service DBObject Name: ' +  obj.modelName);

				const model = getModel(obj);

				if (model) {
					// get the model to register it's schema indexes in db
					await model.createIndexes();
				}
			}
		}));
	}

	private async _startExpress() {
		this.expressApp = (<any>express)();

		const hbs = createHandlebars({
			extname: '.hbs',
			defaultLayout: 'main',
			layoutsDir: path.join('res', 'views', 'layouts'),
			partialsDir: path.join('res', 'templates'),
		});

		// configure Handlebars templates
		this.expressApp.engine('.hbs', hbs.engine);

		this.expressApp.set('views', path.join('res', 'views'));

		this.expressApp.set('view engine', '.hbs');

		this.expressApp.set('view cache', false);

		// now we check if Cert files exists and if not generate them for localhost
		const httpsCertPath = env.HTTPS_CERT_PATH;
		const httpsKeyPath = env.HTTPS_KEY_PATH;

		const hasHttpsCert = fs.existsSync(httpsCertPath);
		const hasHttpsKey = fs.existsSync(httpsKeyPath);

		let hasDefaultHttpsCert = false;

		if (!hasHttpsCert || !hasHttpsKey) {
			hasDefaultHttpsCert = await this._getCertificates(
				httpsCertPath,
				httpsKeyPath
			);
		}

		if ((hasHttpsCert && hasHttpsKey) || hasDefaultHttpsCert) {
			this.httpsServer = https.createServer(
				{
					cert: fs.readFileSync(httpsCertPath),
					key: fs.readFileSync(httpsKeyPath),
				},
				this.expressApp
			);
		}

		this.httpServer = http.createServer(this.expressApp);

		// TODO: add to settings file
		// set connections timeouts to 30 minutes (for long running requests)
		const timeout = 30 * 60 * 1000;

		if (this.httpsServer) {
			this.httpsServer.setTimeout(timeout);
		}

		this.httpServer.setTimeout(timeout);

		this.expressApp.set('host', env.API_HOST);
		this.expressApp.set('httpsPort', env.HTTPSPORT);
		this.expressApp.set('httpPort', env.HTTPPORT);
		this.expressApp.set('environment', env.NODE_ENV);

		// CORS configuration
		// TODO: we may want to restrict access some way
		// (but needs to be careful because we serve some HTML pages for all clients too, e.g. About Us)
		this.expressApp.use(
			(<any>cors)({
				origin: true,
				credentials: true,
			})
		);

		this.expressApp.use(express.urlencoded({ extended: false }));
		this.expressApp.use(express.json());
		this.expressApp.use(express.json({ type: 'application/vnd.api+json' }));

		const mo: any = methodOverride;

		this.expressApp.use(mo('X-HTTP-Method')); // Microsoft
		this.expressApp.use(mo('X-HTTP-Method-Override')); // Google/GData
		this.expressApp.use(mo('X-Method-Override')); // IBM
		this.expressApp.use(morgan('dev'));
		this.expressApp.use(passport.initialize());
		this.expressApp.use(requestIp.mw());
		// the routes below run in the tenant of the request
		this.expressApp.use(tenantHttpMiddleware);

		if (this.expressApp.get('environment') === 'development') {
			const eh: any = errorhandler;
			this.expressApp.use(eh());
		}

		this.expressApp.get('/', function (req, res) {
			res.render('index');
		});

		// Get location (lat, long) by IP address
		// TODO: put into separate service
		this.expressApp.get('/getLocationByIP', (req, res) => {
			const ipStackKey = env.IP_STACK_API_KEY;
			if (ipStackKey) {
				const clientIp = req['clientIp'];

				if (!INTERNAL_IPS.includes(clientIp)) {
					ipstack(clientIp, ipStackKey, (err, response) => {
						res.json({
							latitude: response.latitude,
							longitude: response.longitude,
						});
					});
				} else {
					this.log.info(
						`Can't use ipstack with internal ip address ${clientIp}`
					);
					res.status(204).end();
				}
			} else {
				this.log.error('Not provided Key for IpStack');
				res.status(500).end();
			}
		});

		// TODO: why is this here? It should be in some Nest Controller
		this.expressApp.post('/warehouse/create', async (req, res) => {
			// creates a store in the tenant of the request: its admins only
			const actor = TenantContext.actor();

			if (actor?.role !== 'admin') {
				res.status(401).json({ message: 'Log in as an admin' });
				return;
			}

			if (!actor.isSuperAdmin && actor.tenantRole === 'staff') {
				res.status(403).json({ message: 'Staff cannot add stores' });
				return;
			}

			// server-side fields (hash, flags, tenant, id) never come from the request
			const warehouseCreateObject = stripProtectedFields(
				JSON.parse(req.body.warehouse),
				{ create: true },
			) as IWarehouseCreateObject;

			const warehouse = await this.warehousesService.create(
				warehouseCreateObject
			);
			res.json(warehouse);
		});

		this._setupAuthRoutes();
		this._setupStaticRoutes();

		const host = this.expressApp.get('host');
		const httpsPort = this.expressApp.get('httpsPort');
		const httpPort = this.expressApp.get('httpPort');

		const environment = this.expressApp.get('environment');

		this.log.info(
			{
				host,
				httpsPort,
				httpPort,
				environment,
			},
			'Express server prepare to listen'
		);

		if (httpsPort && httpsPort > 0 && this.httpsServer) {
			// app listen on https
			this.httpsServer.listen(httpsPort, host, () => {
				this.log.info(
					{ port: httpsPort, host: host },
					'Express https server listening'
				);
				console.log(
					`Express https server listening on ${host}:${httpsPort}`
				);
			});
		} else {
			this.log.warn(
				`No SSL Certificate exists, HTTPS endpoint will be disabled`
			);
		}

		if (httpPort && httpPort > 0) {
			// app listen on http
			this.httpServer.listen(httpPort, host, () => {
				this.log.info(
					{ port: httpPort, host: host },
					'Express http server listening'
				);
				console.log(
					`Express http server listening on ${host}:${httpPort}`
				);
			});
		}
	}

	private async _getCertificates(
		httpsCertPath: string,
		httpsKeyPath: string
	) {
		try {
			this.log.info('Generating SSL Certificates for HTTPS');

			const { success } = await this._createCertificateAsync(
				httpsCertPath,
				httpsKeyPath
			);

			this.log.info('Certificates were generated');

			return success;
		} catch (error) {
			this.log.warn(
				`Certificates were not generated due to error: ${error.message}`
			);

			return false;
		}
	}

	private _createCertificateAsync(
		httpsCertPath: string,
		httpsKeyPath: string
	): Promise<{ success: boolean }> {
		return new Promise((resolve, reject) => {
			try {
				pem.createCertificate(
					{
						days: 365,
						selfSigned: true,
					},
					(err, keys) => {
						if (err) {
							reject({ success: false, message: err.message });
							return;
						}

						const httpsCertDirPath = path.dirname(httpsCertPath);
						const httpsKeyDirPath = path.dirname(httpsKeyPath);

						if (!fs.existsSync(httpsCertDirPath)) {
							fs.mkdirSync(httpsCertDirPath, {
								recursive: true,
							});
						}

						if (!fs.existsSync(httpsKeyDirPath)) {
							fs.mkdirSync(httpsKeyDirPath, {
								recursive: true,
							});
						}

						fs.writeFileSync(httpsCertPath, keys.certificate);
						fs.writeFileSync(httpsKeyPath, keys.serviceKey);

						resolve({ success: true });
					}
				);
			} catch (err) {
				reject({ success: false, message: err.message });
			}
		});
	}

	private async _startSocketIO() {
		// Same CORS policy as the express routes above: the apps run on other
		// origins and socket.io (v3+) refuses cross-origin requests unless
		// it is told otherwise.
		const options = { cors: { origin: true, credentials: true } };

		if (this.httpsServer) {
			const ioHttps = new SocketIOServer(this.httpsServer, options);
			await this.routersManager.startListening(ioHttps);
		}

		const ioHttp = new SocketIOServer(this.httpServer, options);
		await this.routersManager.startListening(ioHttp);
	}

	private _setupStaticRoutes() {
		this.expressApp.get('/en/about', function (req, res) {
			res.render('about_us_en');
		});

		this.expressApp.get('/he/about', function (req, res) {
			res.render('about_us_he');
		});

		this.expressApp.get('/ru/about', function (req, res) {
			res.render('about_us_ru');
		});

		this.expressApp.get('/en/privacy', function (req, res) {
			res.render('privacy_en');
		});

		this.expressApp.get('/he/privacy', function (req, res) {
			res.render('privacy_he');
		});

		this.expressApp.get('/ru/privacy', function (req, res) {
			res.render('privacy_ru');
		});

		this.expressApp.get('/en/terms', function (req, res) {
			res.render('terms_of_use_en');
		});

		this.expressApp.get('/he/terms', function (req, res) {
			res.render('terms_of_use_he');
		});

		this.expressApp.get('/ru/terms', function (req, res) {
			res.render('terms_of_use_ru');
		});

		this.expressApp.get('/bg/terms', function (req, res) {
			res.render('terms_of_use_bg');
		});
	}

	private _setupAuthRoutes() {
		// Facebook route auth
		this.expressApp.get(
			'/auth/facebook',
			(req, res, next) => {
				passport[
					'_strategies'
				].session.base_redirect_url = this._getBaseUrl(
					req.header('referer')
				);
				next();
			},
			passport.authenticate('facebook', {
				scope: ['email', 'public_profile'],
			})
		);

		this.expressApp.get(
			'/auth/facebook/callback',
			passport.authenticate('facebook', { failureRedirect: '/login' }),
			async (req, res) => {
				const baseRedirectUr =
					passport['_strategies'].session.base_redirect_url;
				if (req.user) {
					res.redirect(baseRedirectUr + (<any>req.user).redirectUrl);
				} else {
					res.redirect(baseRedirectUr || '');
				}
				passport['_strategies'].session.base_redirect_url = '';
			}
		);

		// Google route auth
		this.expressApp.get(
			'/auth/google',
			(req, res, next) => {
				passport[
					'_strategies'
				].session.base_redirect_url = this._getBaseUrl(
					req.headers.referer
				);
				next();
			},
			passport.authenticate('google', { scope: ['profile', 'email'] })
		);

		this.expressApp.get(
			'/auth/google/callback',
			passport.authenticate('google', { failureRedirect: '/login' }),
			async (req, res) => {
				const baseRedirectUr =
					passport['_strategies'].session.base_redirect_url;
				if (req.user) {
					res.redirect(baseRedirectUr + (<any>req.user).redirectUrl);
				} else {
					res.redirect(baseRedirectUr || '');
				}
				passport['_strategies'].session.base_redirect_url = '';
			}
		);
	}
}
