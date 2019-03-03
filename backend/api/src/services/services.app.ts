import { inject, injectable, multiInject } from 'inversify';
import * as https from 'https';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as passport from 'passport';
import * as methodOverride from 'method-override';
import * as errorhandler from 'errorhandler';
import * as socketIO from 'socket.io';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as morgan from 'morgan';
import * as exphbs from 'express-handlebars';
import { createEverLogger } from '../helpers/Log';
import IService, { ServiceSymbol } from './IService';
import { IRoutersManager } from '@pyro/io';
import { WarehousesService } from './warehouses';
import { SocialStrategiesService } from './users';
import { env } from '../env';
import { getModel } from '@pyro/db-server';
import * as Bluebird from 'bluebird';
import { AdminsService } from './admins';
import ipstack = require('ipstack');
import requestIp = require('request-ip');
import { createConnection } from 'typeorm';
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import { getDummyImage } from '@modules/server.common/utils';
import Admin from '@modules/server.common/entities/Admin';
import Device from '@modules/server.common/entities/Device';
import Carrier from '@modules/server.common/entities/Carrier';
import Invite from '@modules/server.common/entities/Invite';
import InviteRequest from '@modules/server.common/entities/InviteRequest';
import Order from '@modules/server.common/entities/Order';
import Product from '@modules/server.common/entities/Product';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import User from '@modules/server.common/entities/User';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { ConfigService } from '../config/config.service';

// local IPs
const INTERNAL_IPS = ['127.0.0.1', '::1'];

@injectable()
export class ServicesApp {
	protected db_server = process.env.DB_ENV || 'primary';
	protected db = mongoose.connection;

	protected expressApp: express.Express;
	protected httpsServer: https.Server;
	protected httpServer: http.Server;

	private log = createEverLogger({ name: 'main' });

	// TODO: put to config (we also may want to increase it)
	private static _poolSize: number = 50;

	// TODO: put to config
	private static _connectTimeoutMS: number = 40000;

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
		https.globalAgent.maxSockets = maxSockets;
		http.globalAgent.maxSockets = maxSockets;

		this._configDB();
	}

	async start() {
		await this._connectDB();
	}

	static getEntities() {
		const entities = [
			Admin,
			Carrier,
			Device,
			Invite,
			InviteRequest,
			Order,
			Product,
			ProductsCategory,
			User,
			Warehouse
		];
		return entities;
	}

	static async CreateTypeORMConnection() {
		// list of entities for which Repositories will be greated in TypeORM
		const entities = ServicesApp.getEntities();

		const conn = await createConnection({
			name: 'typeorm',
			// TODO: put this into settings (it's mongo only during testing of TypeORM integration!)
			type: 'mongodb',
			url: env.DB_URI,
			entities,
			synchronize: true,
			useNewUrlParser: true,
			autoReconnect: true,
			reconnectTries: Number.MAX_VALUE,
			poolSize: ServicesApp._poolSize,
			connectTimeoutMS: ServicesApp._connectTimeoutMS,
			logging: true
		});

		console.log(
			`TypeORM DB connection created. DB connected: ${conn.isConnected}`
		);

		return conn;
	}

	private _gracefulExit() {
		try {
			if (this.db != null) {
				this.db.close(() => {
					this.log.info(
						'Mongoose default connection with DB :' +
							this.db_server +
							' is disconnected through app termination'
					);
					process.exit(0);
				});
			}
		} catch (err) {
			process.exit(0);
		}
	}

	private _configDB() {
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

		this.db.once('open', () => this._onDBConnect());

		// If the Node process ends, close the Mongoose connection
		process
			.on('SIGINT', this._gracefulExit)
			.on('SIGTERM', this._gracefulExit);
	}

	private async _connectDB() {
		try {
			mongoose.connect(
				env.DB_URI,
				{
					useCreateIndex: true,
					useNewUrlParser: true,
					autoReconnect: true,
					useFindAndModify: false,
					reconnectTries: Number.MAX_VALUE,
					poolSize: ServicesApp._poolSize,
					connectTimeoutMS: ServicesApp._connectTimeoutMS
				} as any,
				(err) => {
					if (err != null) {
						this.log.error(err);
					}
				}
			);

			this.log.info('Trying to connect to DB ' + this.db_server);
		} catch (err) {
			this.log.error(err, 'Sever initialization failed!');
		}
	}

	private async _onDBConnect() {
		await this._registerModels();
		await this._registerEntityAdministrator();
		this._passportSetup();
		this._startExpress();
		this._startSocketIO();
	}

	/**
	 * Create initial (default) Admin user with default credentials:
	 * Email: admin@ever.co
	 * Password: admin
	 *
	 * @private
	 * @memberof ServicesApp
	 */
	private async _registerEntityAdministrator() {
		const adminEmail = 'admin@ever.co'; // TODO: put to config
		const adminPassword = 'admin'; // TODO: put to config

		const adminCollectionCount = await this._adminsService.count({
			email: adminEmail
		});

		if (adminCollectionCount === 0) {
			this._adminsService.register({
				admin: {
					email: adminEmail,
					name: 'Admin',
					hash: null,
					pictureUrl: getDummyImage(300, 300, 'A')
				},
				password: adminPassword
			});
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
		await Bluebird.map(this.services, async (service) => {
			if ((service as any).DBObject != null) {
				// get the model to register it's schema indexes in db
				await getModel((service as any).DBObject).createIndexes();
			}
		});
	}

	private _startExpress() {
		// that's important to see even if logs disabled, do not remove!
		console.log('Connected to DB');

		this.log.info({ db: this.db_server }, 'Connected to DB');

		this.expressApp = express();

		const hbs = exphbs.create({
			extname: '.hbs',
			defaultLayout: 'main',
			layoutsDir: path.join('res', 'views', 'layouts'),
			partialsDir: path.join('res', 'templates')
		});

		// configure Handlebars templates
		this.expressApp.engine('.hbs', hbs.engine);

		this.expressApp.set('views', path.join('res', 'views'));

		this.expressApp.set('view engine', '.hbs');

		this.expressApp.set('view cache', false);

		// TODO: this is probably a good place to check if Cert files exists and if not generate them for localhost
		this.httpsServer = https.createServer(
			{
				cert: fs.readFileSync(env.HTTPS_CERT_PATH),
				key: fs.readFileSync(env.HTTPS_KEY_PATH)
			},
			this.expressApp
		);

		this.httpServer = http.createServer(this.expressApp);

		// TODO: add to settings file
		// set connections timeouts to 30 minutes (for long running requests)
		const timeout = 30 * 60 * 1000;
		this.httpsServer.setTimeout(timeout);
		this.httpServer.setTimeout(timeout);

		this.expressApp.set('httpsPort', env.HTTPSPORT);
		this.expressApp.set('httpPort', env.HTTPPORT);
		this.expressApp.set('environment', env.NODE_ENV);

		// CORS configuration
		// TODO: we may want to restric access some way
		// (but needs to be careful because we serve some HTML pages for all clients too, e.g. About Us)
		this.expressApp.use(
			cors({
				origin: true,
				credentials: true
			})
		);

		this.expressApp.use(bodyParser.urlencoded({ extended: false }));
		this.expressApp.use(bodyParser.json());
		this.expressApp.use(
			bodyParser.json({ type: 'application/vnd.api+json' })
		);
		this.expressApp.use(methodOverride('X-HTTP-Method')); // Microsoft
		this.expressApp.use(methodOverride('X-HTTP-Method-Override')); // Google/GData
		this.expressApp.use(methodOverride('X-Method-Override')); // IBM
		this.expressApp.use(morgan('dev'));
		this.expressApp.use(passport.initialize());
		this.expressApp.use(requestIp.mw());

		if (this.expressApp.get('environment') === 'development') {
			this.expressApp.use(errorhandler());
		}

		this.expressApp.get('/', function(req, res) {
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
							longitude: response.longitude
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
			const warehouseCreateObject: IWarehouseCreateObject = JSON.parse(
				req.body.warehouse
			);

			const warehouse = await this.warehousesService.create(
				warehouseCreateObject
			);
			res.json(warehouse);
		});

		this._setupAuthRoutes();
		this._setupStaticRoutes();

		const httpsPort = this.expressApp.get('httpsPort');
		const httpPort = this.expressApp.get('httpPort');

		const conf = require('dotenv').config();

		const environment = this.expressApp.get('environment');

		this.log.info(
			{
				httpsPort,
				httpPort,
				environment,
				'process.env': process.env,
				dotenv: conf
			},
			'Express server prepare to listen'
		);

		if (httpsPort && httpsPort > 0) {
			// app listen on https
			this.httpsServer.listen(httpsPort, () => {
				this.log.info(
					{ port: httpsPort },
					'Express https server listening'
				);
				console.log(
					`Express https server listening on port ${httpsPort}`
				);
			});
		}

		if (httpPort && httpPort > 0) {
			// app listen on http
			this.httpServer.listen(httpPort, () => {
				this.log.info(
					{ port: httpPort },
					'Express http server listening'
				);
				console.log(
					`Express http server listening on port ${httpPort}`
				);
			});
		}
	}

	private _startSocketIO() {
		const ioHttps = socketIO(this.httpsServer);
		const ioHttp = socketIO(this.httpServer);

		this.routersManager.startListening(ioHttps);
		this.routersManager.startListening(ioHttp);
	}

	private _setupStaticRoutes() {
		this.expressApp.get('/en/about', function(req, res) {
			res.render('about_us_en');
		});

		this.expressApp.get('/he/about', function(req, res) {
			res.render('about_us_he');
		});

		this.expressApp.get('/ru/about', function(req, res) {
			res.render('about_us_ru');
		});

		this.expressApp.get('/en/privacy', function(req, res) {
			res.render('privacy_en');
		});

		this.expressApp.get('/he/privacy', function(req, res) {
			res.render('privacy_he');
		});

		this.expressApp.get('/ru/privacy', function(req, res) {
			res.render('privacy_ru');
		});

		this.expressApp.get('/en/terms', function(req, res) {
			res.render('terms_of_use_en');
		});

		this.expressApp.get('/he/terms', function(req, res) {
			res.render('terms_of_use_he');
		});

		this.expressApp.get('/ru/terms', function(req, res) {
			res.render('terms_of_use_ru');
		});

		this.expressApp.get('/bg/terms', function(req, res) {
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
					req.headers.referer
				);
				next();
			},
			passport.authenticate('facebook', {
				scope: ['email', 'public_profile']
			})
		);

		this.expressApp.get(
			'/auth/facebook/callback',
			passport.authenticate('facebook', { failureRedirect: '/login' }),
			async (req, res) => {
				const baseRedirectUr =
					passport['_strategies'].session.base_redirect_url;
				if (req.user) {
					res.redirect(baseRedirectUr + req.user.redirectUrl);
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
					res.redirect(baseRedirectUr + req.user.redirectUrl);
				} else {
					res.redirect(baseRedirectUr || '');
				}
				passport['_strategies'].session.base_redirect_url = '';
			}
		);
	}
}
