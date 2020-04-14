# Ever Backend API

This is a real-time API backend project, written in [TypeScript](https://www.typescriptlang.org/) using [NodeJS](https://nodejs.org/), [Nest](https://nestjs.com), [ExpressJS](https://expressjs.com/) and other libraries.

It includes/has features of:

-   **Real-time API** - The project uses [Socket.IO](https://socket.io/) and [RxJS](http://reactivex.io/rxjs/) for its reactive and real-time nature.
-   **Database** - [MongoDB](https://www.mongodb.com/) is used as the DB and [Mongoose](http://mongoosejs.com/) as the ORM.
-   **Deployment** - The production versions could be deployed to [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/), using [PM2](http://pm2.io/) for clustering and fault tolerance.
-   **Payments Accepting** - via Stripe API.

#### Main stack:

-   [TypeScript](https://www.typescriptlang.org) - Main Programming Language.
-   [NodeJS](https://nodejs.org) - Run-time environment.
-   [NestJS](https://nestjs.com) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
-   [MongoDB](https://www.mongodb.com/) - Database.
-   [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) - Hosting (optionally).
-   [Stripe API](https://stripe.com/docs/api/node) - Payments accepting.

#### Also used:

-   [ExpressJS](https://expressjs.com/) - Web Framework
-   [Socket.IO](https://socket.io/) - For Real-time API
-   [RxJS](http://reactivex.io/rxjs/) - For Reactive/Event Based Programming
-   [InversifyJS](http://inversify.io/) - Inversion Control (Dependency Injection, used in addition to NestJS DI)
-   [Mongoose](http://mongoosejs.com/) - ORM
-   [PM2](http://pm2.io/) - NodeJS Production process manager (optionally, used in production environments)

## Usage

### Setting Up

1. Install the dependeinces by running:
    ```
    $ yarn install
    ```
2. Take a look for `.env.template` file, create `.env` file with the same variables and fill them appropriately.

### Starting

Simply run:

```
$ yarn start
```

_Note: make sure you have MongoDB installed locally with default settings_

### Testing

To run tests execute following command:

```
$ yarn run test
```

### Deployment

_To be added_

## Backend Project Structure

```
/.ebextensions  - folder with AWS Elastic Beanstalk configuration files.
/.elasticbeanstalk  - folder AWS Elastic Beanstalk configuration files.
/build - TypeScript transpiler build directory.
/certificates - SSL Certificates (optionally)
/dist - WebPack build output directory
/docker - Docker configuration (currently not in use)
/node_modules - folder with NPM packages (created after `yarn install`)
/res - Resourses, such as pages that sent to the clients in text form or json.

/src - All the code of the project
|-->/app.ts - The main application file.
|-->/inversify.config.ts - The Dependency Injection config.
|-->/pm2bootstrap.ts - The file AWS runs to start the program.
|
|-->/main - The main application file
|-->/modules -  contains the shared modules used in this project.
|-->/pyro - Custom written library for socket io and mongoose wrapping with classes.
\-->/test - Testing code

/tmp/logs - All the logs created during server run locally or in production

/.env - The configuration file. (which developer should create from .env.template)
/.env.template - The configuration file template.
/package.json - NPM packages config file.
/tsconfig.json - TypeScript compiler config file.
```

## Pyro - Custom-built Micro-Framework

### Pyro DB

Pyro DB is a wrapper for mongoose written in TypeScript which allows declaring models like that:

```javascript
@ModelName('User')
class User extends DBObject<IUser, IUserCreateObject> implements IUser {

    @Schema({ type: String, required: false })
    public firstName?: string;

    @Schema({ type: String, required: false })
    public lastName?: string;

    @Schema({ type: String, required: false })
    public email?: string;

    @Schema(getSchema(GeoLocation)) public geoLocation: GeoLocation;
    @Types.String() public apartment: string;

    @Schema({ type: String, required: false })
    public stripeCustomerId?: string;

    @Schema([String]) public devicesIds: string[];
}
```

-   The `@ModelName` decorator signals that a class is a model.
-   `@Schema` specifies the schema of some field, `getSchema` is used to use embed other model.
-   `@Types.String(default)`, `@Types.Number(default)`, `@Types.Boolean(default)` and `@Types.Date(default)` are used for primitive schemas. All of them are not nullable by default.
-   To make a reference to some model in another collection. `@Types.Ref` is used like this:

    ```javascript
    @Types.Ref(Carrier, { required: false })
    ```

It also contains the `DBService` abstract base class, which contains basic operations for every model with collection in the database. It follows the following structure:

```javascript
export interface IDBService<CreateObject, DBObject extends CreateObject> {
    create(createObject: CreateObject): Promise<DBObject>;
    remove(objectId: string): Promise<void>;
    removeAll(): Promise<void>;
    get(objectId: string): Observable<DBObject | null>;
    getMultiple(ids: string[]): Observable<DBObject[]>;
    find(conditions): Promise<DBObject[]>;
    findOne(conditions): Promise<DBObject | null>;
    update(objectId: string, updateObj: any): Promise<DBObject>;
    updateMultiple(findObj: any, updateObj: any): Promise<DBObject[]>;
    updateMultipleByIds(ids: string[], updateObj: any): Promise<DBObject[]>;
}
```

Many of the services in this projects extend `DBService`, for example:

```javascript
class WarehousesService extends DBService<IWarehouseCreateObject, IWarehouse, Warehouse> implements IWarehouseRouter, IService {
    public readonly DBObject = Warehouse;

    ...

    @observableListener()
    get(id: string) {
        return super.get(id);
    }
}
```

To make any method of the `DBService` publicly available as part of the API please use the `@<some>Listener` from Pyro IO.

### Pyro IO

#### Overview

Allows declaring routers with auto generated Socket.io API right inside existed Services.
That makes it possible to execute corresponding Service methods from incoming WebSocket messages and reply back without the need to create additional Controllers on top of Services

```javascript
@routerName('users')
class UsersService {
	// returns Observable!
	@observableListener()
	get(id: string): Observable<User> {
		// ...
	}

	// returns Promise!
	@asyncListener()
	async register(user: IUserCreateObject): Promise<User> {
		// ...
	}
}
```

#### Decorators

-   `@routerName` - marks the class as a router. That makes it possible to call Service methods via WebSockets connection.
-   `@observableListener()` is used to mark methods that return observable which allows real-time data-transfer to the client.
-   `@asyncListener()` is used to mark methods that return promise, which allows returning one time response to the client.
