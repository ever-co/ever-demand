# Ever - Open-Source On-Demand Commerce Platform

[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/ever)
[![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/ever-co/ever?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/evereq?utm_source=github&utm_medium=button&utm_term=evereq&utm_campaign=github)

[Ever](https://ever.co)® is an Open-Source, Real-Time, Reactive, **On-Demand** Commerce Platform build with [TypeScript](http://www.typescriptlang.org).

Out-of-the-box Ever® Platform™ provides everything required to quickly build, manage and expand Multi-Store (Multi-Vendor / Peer-to-Peer Marketplace) or Single-Store **On-Demand** Commerce Solutions with customized e-commerce Websites (Shops), Mobile ordering Apps (Hybrid and PWA), Carrier (Driver) Mobile Apps, Merchant Apps and Admin interface Website.

![overview](https://docs.ever.co/docs/assets/overview.jpg)

### Disclaimer

_A word of caution_: We are in α (alpha), i.e. Ever® Platform™ is very much under development (work in progress, WIP).  
Expect _lots_ of changes and some :bug: and please be nice! :stuck_out_tongue_winking_eye:

## Features

-   Open Platform (every part is Open-Source)
-   Everything Reactive, Real-Time and Blazing Fast!
-   Headless Commerce framework, which allows different implementations of store-fronts, Admin UIs and client apps. Exposes rich GraphQL, REST and WS APIs.
-   Shopping Mobile App for customers to make On-Demand orders (iOS and Android using Ionic / Ionic Native)
-   Carrier Mobile App for carriers, drivers or delivery service providers (iOS and Android using Ionic / Ionic Native)
-   Shopping e-commerce Website for customers to make in-browser On-Demand purchases of food, goods or services
-   Merchant Tablet App used by Stores/Merchants/Warehouses to manage & track orders, organize deliveries, etc.
-   Admin Website used to manage all platform features and settings in the single Web-based interface
-   Multi-language and culture settings accross Platform (i18N)
-   Products Catalogs (global and per Merchant) with Multiple Product Images
-   Inventory/Stock Management and Real-time Order Management/Processing accross the Platform
-   Deliveries/Shipping management and processing accross Platform (shipping with real-time location tracking for On-Demand orders)
-   Real-Time discounts, promotions and products/services availability updates
-   Customers registration, Guest Checkouts, Invitations (optional)
-   Gateway and Payment Processing (currently supported Payments Gateway - [Stripe](https://stripe.com))
-   Plugins / Extensions / Custom Fields (WIP)

## Planned Features

-   Tax Calculations
-   Third-party Shipping providers integrations
-   Users Roles / Permissions accross Platform
-   Large products catalogs with products variants, facets and full-text search

You can also track feature requests from the community in the [separate repo](https://github.com/ever-co/feature-requests/issues).

## Technology Stack and Requirements

-   [TypeScript](https://www.typescriptlang.org) language (version >=2.9)
-   [Node.js](https://nodejs.org) (version >=10)
-   [Ionic](https://ionicframework.com) (version 4) for Shopping Mobile App, Carrier Mobile App and Merchant Tablet App
-   Shopping Website developed with [Angular](https://angular.io) 7 using [Angular Starter](https://github.com/gdi2290/angular-starter)
-   Admin Website developed with [Angular](https://angular.io) version 7 using [ngx-admin](https://github.com/akveo/ngx-admin)
-   Headless Commerce framework (Backend APIs/Server) developed using [Nest](https://github.com/nestjs/nest) with heavy use of our own Pyro module. Supports GraphQL, REST and WS Real-Time APIs (WebSockets using [Socket.io](https://socket.io) library)
-   [RxJS](http://reactivex.io/rxjs) library used heavy in every part of the Platform
-   [InversifyJS](http://inversify.io) used for Inversion Control / Dependency Injection in most parts of the Platform. On the Backend/API we also use DI provided by [Nest](https://github.com/nestjs/nest)
-   [MongoDB](https://www.mongodb.com) Database used with [Mongoose](https://mongoosejs.com) ORM (supported MongoDB version >= 3.2; we recommend version >=4)
-   We have ongoing effort (WIP) to add support for other databases using [TypeORM](https://github.com/typeorm/typeorm) and [Prisma](https://github.com/prisma/prisma). Following additional DBs will be fully supported: MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server and Oracle.
-   For production, we integrate and recommend to use [PM2](https://github.com/Unitech/pm2)

#### See also README.md and CREDITS.md files in relevant folders for lists of libraries and software included in the Platform, information about licenses and other details.

## Documentation

Please refer to our official [Platform Documentation](https://docs.ever.co) and to our [Wiki](https://github.com/ever-co/ever/wiki) (WIP).

For quick overview of each project in the Platform (Server, Admin, Shops, etc), you can search for README.md file in the root of the projects folders. For example, see [./backend/api/README.md](backend/api/README.md) for Server (Backend) related overview.

## Getting Started

We follow [Gitflow Workflow](https://nvie.com/posts/a-successful-git-branching-model) so the [`develop` branch](https://github.com/ever-co/ever/tree/develop) may be in an unstable or even broken state during development. Please use [releases](https://github.com/ever-co/ever/releases) or [`master` branch](https://github.com/ever-co/ever/tree/master) instead of the `develop` branch in order to get more stable code.

### Clone Repo

Clone the Ever Platform Git repo:

```
git clone -c core.symlinks=true --recursive git@github.com:ever-co/ever.git
```

Note: it's important to enable Git symlinks because they are used for shared modules (every project have symlinks to common shared modules in the /shared folder)

If you use Git >= v2.14, it probably make sense to setup following globally:

```
git config --global core.symlinks true
git config --global submodule.recurse true
```

Notes:

-   to setup Symlinks & Submodules recurse locally only (for Ever repo), remove `--global` in the commands above
-   for older Git versions see [this](https://stackoverflow.com/questions/4611512/is-there-a-way-to-make-git-pull-automatically-update-submodules/4611550#4611550)
-   at the moment we are not using Git sub-modules, but it may change in the future (we were using them, but decided to drop for now in favor of symlinks)

### Yarn

Currently we are using `Yarn` (instead of `npm`), so make sure you have latest Yarn version installed before running Ever Platform:

```
npm install -g yarn@latest
```

### Quick installation

After git repo is cloned, just run following command to install/bootstrap all dependencies:

```
yarn bootstrap
```

This will install required packages in all Platform projects using Lerna

Note: if above command fails for any reason, you can try to install required packages manually by running `yarn` inside every sub-folder with 'package.json' file

### Lerna (manual installation)

We are using [Lerna](https://github.com/lerna/lerna) for mono-repo management.
You need to run the following command from working folder where you cloned Ever git repo, which will install Lerna together with other packages:

```
yarn
```

You may instead install Lerna globally:

```
npm install lerna@latest -g
```

Now, after Lerna installed (locally or globally), you need to Bootstrap all dependencies manually:

```
yarn lerna bootstrap
```

The command above will install all required packages for every sub-project of the Ever Platform.

### MongoDB

Ever platform configured to use MongoDB by default and assume you have MongoDB service running and accepting connections on default `localhost:27017`. Please see relevant section in our [documentation](https://github.com/ever-co/ever/wiki/MongoDB).

### Platform Configuration

See relevant section in our [documentation](https://github.com/ever-co/ever/wiki/Ever-Platform-Configuration).

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

## Metrics

According to [cloc](https://github.com/AlDanial/cloc) project, Ever Platform today has more than 120K lines of TypeScript, GraphQL, HTML / CSS and other code files. You can get more details at the relevant section of our [documentation](https://github.com/ever-co/ever/wiki/Metrics).

## Contribute

-   Please give us :star: on Github, it **really** helps!
-   You are more than welcome to submit feature requests in the [separate repo](https://github.com/ever-co/feature-requests/issues)
-   Pull requests are always welcome! Please base pull requests against the _develop_ branch and follow the [contributing guide](.github/CONTRIBUTING.md).

## Collaborators and Contributors

### Development Team

#### Core

-   Ruslan Konviser ([Evereq](https://github.com/evereq))
-   Michael Konviser ([Komish](https://github.com/MrKomish))

#### Developers

-   Alish Meklyov ([Alish](https://github.com/AlishMekliov931))
-   Blagovest Gerov ([BlagovestGerov](https://github.com/BlagovestGerov))
-   Boyan Stanchev ([boyanstanchev](https://github.com/boyanstanchev))
-   Elvis Arabadjiyski ([Dreemsuncho](https://github.com/Dreemsuncho))
-   Emil Momchilov ([jew-er](https://github.com/jew-er))

#### Graphic Designer & QA

-   Julia Konviser

### Contributors

-   View all of our [contributors](https://github.com/ever-co/ever/graphs/contributors)

## Contact Us

-   [Spectrum Community](https://spectrum.chat/ever)
-   [Gitter Chat](https://gitter.im/ever-co/ever)
-   [Discord Chat](https://discord.gg/msqRJ4w)
-   [CodeMentor](https://www.codementor.io/evereq)
-   [Telegram](https://t.me/everplatform)
-   For business inquiries: <mailto:ever@ever.co>
-   Please report security vulnerabilities to <mailto:security@ever.co>
-   [Ever Platform @ Twitter](https://twitter.com/everplatform)
-   [Ever Platform @ Facebook](https://www.facebook.com/everplatform)

## Security

Ever Platform follows good security practices, but 100% security cannot be guaranteed in any software!  
Ever Platform is provided AS IS without any warranty. Use at your own risk!  
See more details in the [LICENSE.md](LICENSE.md).

In production setup, all client-side to server-side (backend, APIs) communications should be encrypted using HTTPS/WSS/SSL (REST APIs, GraphQL endpoint, Socket.io WebSockets, etc).

## License

This software is available under different licenses

### _Ever Platform Community Edition_ License

Different parts of the Platform are made available under the terms of the separate Open-Source licenses:

-   Shopping Mobile App and Carrier Mobile App under [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.txt)
-   Backend Api (Server), Admin Website, Merchant Tablet App and Merchant Website, Shopping Website under [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
-   Pyro shared modules under [MIT License](https://opensource.org/licenses/MIT)
-   Other shared modules under [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.txt)

If you decide to choose the Ever® Platform Community™ Edition License, you must comply with the following terms:

This program is free software: you can redistribute it and/or modify it under the terms of the corresponding licenses described in the LICENSE.md files located in software sub-folders and under the terms of licenses described in individual files.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

You should have received a copy of the relevant GNU Licenses along with this program. If not, see http://www.gnu.org/licenses/.

### _Ever Platform Enterprise_ License

Alternatively, commercial versions of the software must be used in accordance with the terms and conditions of separate written agreement between you and Ever Co. LTD.

For more information about Ever® Platform Enterprise™ License please contact <mailto:ever@ever.co>.

#### The default Ever® Platform™ license, without a valid Ever® Platform Enterprise™ License agreement, is the Ever® Platform Community™ Edition License.

#### Please see [LICENSE.md](LICENSE.md) for more information on licenses.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fever-co%2Fever.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fever-co%2Fever?ref=badge_large)

## Trademarks

**Ever**® is a registered trademark of [Ever Co. LTD](https://ever.co).  
**Ever® Platform™**, **Ever® Platform Community™** and **Ever® Platform Enterprise™** are all trademarks of [Ever Co. LTD](https://ever.co).

The trademarks may only be used with the written permission of Ever Co. LTD. and may not be used to promote or otherwise market competitive products or services.

All other brand and product names are trademarks, registered trademarks or service marks of their respective holders.

#### Copyright © 2016-present, Ever Co. LTD. All rights reserved.

[![Circle CI](https://circleci.com/gh/ever-co/ever.svg?style=svg)](https://circleci.com/gh/ever-co/ever)
[![codecov](https://codecov.io/gh/ever-co/ever/branch/master/graph/badge.svg)](https://codecov.io/gh/ever-co/ever)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e7b2b38660f44963989ac9d49ae76d4d)](https://www.codacy.com/app/Ever/ever?utm_source=github.com&utm_medium=referral&utm_content=ever-co/ever&utm_campaign=Badge_Grade)
[![DeepScan grade](https://deepscan.io/api/teams/3293/projects/4849/branches/38566/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=3293&pid=4849&bid=38566)
[![Known Vulnerabilities](https://snyk.io/test/github/ever-co/ever/badge.svg)](https://snyk.io/test/github/ever-co/ever)
[![Greenkeeper badge](https://badges.greenkeeper.io/ever-co/ever.svg)](https://greenkeeper.io)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fever-co%2Fever.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fever-co%2Fever?ref=badge_shield)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io)
