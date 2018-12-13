# Ever - Open-Source On-Demand Commerce Platform

[![Circle CI](https://circleci.com/gh/ever-co/ever.svg?style=svg)](https://circleci.com/gh/ever-co/ever)
[![codecov](https://codecov.io/gh/ever-co/ever/branch/master/graph/badge.svg)](https://codecov.io/gh/ever-co/ever)
[![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/ever-co/ever?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/evereq?utm_source=github&utm_medium=button&utm_term=evereq&utm_campaign=github)

<!---[![Known Vulnerabilities](https://snyk.io/test/github/ever-co/ever/badge.svg)](https://snyk.io/test/github/ever-co/ever) [![Greenkeeper badge](https://badges.greenkeeper.io/ever-co/ever.svg)](https://greenkeeper.io/)--->

[Ever](https://ever.co)® is an Open-Source, Real-Time, Reactive, **On-Demand** Commerce Platform build with TypeScript.

Out-of-the-box Ever Platform provides everything required to quickly build Multi-Store (Marketplace) or Single-Store **On-Demand** Platform with customized e-commerce Websites (shops), Mobile ordering apps, Carrier (Driver) apps, Merchant apps and Admin website.

So, if you need to build the next "Uber for X", Ever Platform is your right choice!

#### NOTE: We are in α (alpha). Expect lots of changes and please be nice! ;)

## Features

-   Open Platform (every part is Open-Source)
-   Shopping Mobile App for customers to make On-Demand orders (iOS and Android using Ionic / Ionic Native)
-   Carrier Mobile App for carriers, drivers or delivery service providers (iOS and Android using Ionic / Ionic Native)
-   Shopping e-commerce Website for customers to make in-browser On-Demand purchases of food, goods or services
-   Merchant Tablet App used by Stores/Merchants/Warehouses to manage & track orders, organize deliveries, etc.
-   Admin Website used to manage all platform features and settings in the single Web-based interface
-   Multi-language and culture settings accross (i18N) Platform
-   Products Catalogs (global and per Merchant) with Multiple Product Images
-   Inventory Management and Real-time Order Management accross Platform
-   Deliveries processing accross Platform (shipping with real-time location tracking)
-   Real-Time discounts, promotions and products/services availability updates
-   Payments (currently supported Payments Gateway - [Stripe](https://stripe.com))

## Technology Stack and Requirements

-   Almost every part of the Platform developed using [TypeScript](https://www.typescriptlang.org) language (version >=2.9)
-   Most of projects require [Node.js](https://nodejs.org) (version >=8)
-   Shopping Mobile App developed using [Ionic](https://ionicframework.com) version 4
-   Carrier Mobile App developed using [Ionic](https://ionicframework.com) version 3
-   Shopping Website developed with [Angular](https://angular.io) 6 using [Angular Starter](https://github.com/gdi2290/angular-starter)
-   Merchant Tablet App developed using [Ionic](https://ionicframework.com) version 3
-   Admin Website developed with [Angular](https://angular.io) version 6 using [ngx-admin](https://github.com/akveo/ngx-admin)
-   Backend Api (Server) developed using [Nest](https://github.com/nestjs/nest) with heavy use of our own Pyro module. We support both REST and GraphQL APIs. Real-Time communications use [Socket.io](https://socket.io) library
-   [RxJS](http://reactivex.io/rxjs) library used heavy in every part of the Platform
-   [InversifyJS](http://inversify.io) used for Inversion Control / Dependency Injection in most parts of the Platform. On the Backend/API we also use DI provided by [Nest](https://github.com/nestjs/nest)
-   [MongoDB](https://www.mongodb.com) Database used with [Mongoose](https://mongoosejs.com) ORM (supported MongoDB version >= 3.2; we recommend version >=4)
-   For production, we integrate and recommend to use [PM2](https://github.com/Unitech/pm2)

#### See also README.md and CREDITS.md files in relevant folders for lists of libraries and software included in the Platform, information about licenses and other details.

## Documentation

Please refer to https://docs.ever.co for the Platform Documentation (work in progress)

For quick overview of each project in the Platform (Server, Admin, Shops, etc), you can search for README.md file in the root of the projects folders. For example, see [./backend/api/README.md](backend/api/README.md) for Server (Backend) related overview.

## Getting Started

### MongoDB

You can download and install free Community version of MongoDB from the [official MongoDB download center](https://www.mongodb.com/download-center/v2/community).

After installation, make sure MongoDB service is running and accepting connections on default `localhost:27017` (change connection parameters in the ./backend/api/.env file if you run on different location/port)

To manage database, you can use free [MongoDB Compass Community Edition available](https://www.mongodb.com/download-center/v2/compass) or some other GUI for MongoDB, e.g. Studio 3T (https://studio3t.com)

### Clone Repo

Clone the Ever Platform Git repo:

```
git clone -c core.symlinks=true --recursive git@github.com:ever-co/ever.git
```

If you use Git >= v2.14, it could be make sense to setup following globally:

```
git config --global core.symlinks true
git config --global submodule.recurse true
```

Notes:

- to setup Symlinks & Submodules recurse locally only (for Ever repo), remove ```--global``` in the commands above  
- for older Git versions see https://stackoverflow.com/questions/4611512/is-there-a-way-to-make-git-pull-automatically-update-submodules/4611550#4611550  
- at the moment we are not using Git sub-modules, but it may change in the future  

### Lerna

We are using Lerna (https://github.com/lerna/lerna), so you may want to install it globally (recommended):

```
npm install lerna@latest -g
```

Next you need to Bootstrap all dependencies:

```
yarn bootstrap
```

### Platform Configuration

We created template & initial configuration files (with reasonable defaults) for each project in the Platform, to save your time and keep things simple:

-   For _Backend (API)_ configuration, the `./backend/api/.env.template` file should be copied into `./backend/api/.env` and relevant changes should (optionally) be done.

    **IMPORTANT**: you should have `./backend/api/.env` file in place to be able to run the Platform on developer machine

-   For _Admin_ Angular App configuration, see `./admin/website-angular/src/environments/environment.ts` and `./admin/website-angular/src/environments/environment.prod.ts` files

-   For _Merchant_ Ionic App configuration, see `./merchant/tablet-ionic/src/environments/environment.ts` and `./merchant/tablet-ionic/src/environments/environment.prod.ts` files. If you need to run Merchant App using PM2 (as Web app, not Tablet App), needs copy `./merchant/tablet-ionic/.env.template` to `./merchant/tablet-ionic/.env` and make relevant changes (if required)

-   For _Shopping Mobile_ App (Ionic) configuration, see `./shop/mobile-ionic/src/environments/environment.ts` and `./shop/mobile-ionic/src/environments/environment.prod.ts` files

-   For _Shopping Website_ configuration, see `./shop/website-angular/src/environments/environment.ts` and `./shop/website-angular/src/environments/environment.prod.ts` files

-   For _Carrier Mobile_ App (Ionic) configuration, see `./carrier/mobile-ionic/src/environments/environment.ts` and `./carrier/mobile-ionic/src/environments/environment.prod.ts` files

Notes:

-   for initial development run no changes required in the `environment.ts` files, unless changes were done to the Backend (API) configuration. However, to enable some of the Platform features, you may need to change relevant configurations at corresponding files.

-   files environment.prod.ts are configurations for production environments/builds only (you should probably not publish them, unless you removed all private/secure parameters).

### Run Platform Projects

Finally, each project from Ever Platform can be started by single command from this list:

```
 yarn run:server # Run API server
 yarn run:admin # Run Admin Website
 yarn run:merchant # Run Merchant Ionic Tablet App
 yarn run:shopmobile # Run Shopping Mobile App
 yarn run:shopweb # Run Shopping Website
 yarn run:carrier # Run Carrier Mobile app
```

Note: on the first run, API Server (Backend) will create MongoDB local database `ever_development` with the following (default) Admin user

-   email: `admin@ever.co`
-   password: `admin`

You can use credentials above to login into Platform Admin App, which available locally at http://localhost:4200 (by default)

## Contribute

-   Please give us :star: on Github, it **really** helps!
-   You are more than welcome to submit feature requests in the separate repo: [https://github.com/ever-co/feature-requests/issues](https://github.com/ever-co/feature-requests/issues)

## Contact Us

-   [Gitter Chat](https://gitter.im/ever-co/ever)
-   [Discord Chat](https://discord.gg/msqRJ4w)
-   [CodeMentor](https://www.codementor.io/evereq)
-   For business inquiries: <mailto:ever@ever.co>
-   Please report security vulnerabilities to <mailto:security@ever.co>

## License

Different parts of the Platform are made available under the terms of the separate licenses

-   Shopping Mobile App and Carrier Mobile App - [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.txt)
-   Shopping Website - [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
-   Merchant Tablet App and Merchant Website - [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
-   Admin Website - [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
-   Backend Api (Server) - [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
-   Pyro shared modules - [MIT License](https://opensource.org/licenses/MIT)
-   Other shared modules - [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.txt)

#### Please see [LICENSE.md](LICENSE.md) for more information on licenses.

#### See also individual files and LICENSE.md files in corresponding sub-folders for more licenses related details for corresponding Platform parts.

## Trademarks

**Ever**® is a registered trademark of [Ever Co. LTD](https://ever.co).

The trademark may only be used with the written permission of Ever Co. LTD. and may not be used to promote or otherwise market competitive products or services.

All other brand and product names are trademarks, registered trademarks or service marks of their respective holders.

#### Copyright © 2016-present, Ever Co. LTD. All rights reserved.
