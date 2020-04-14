#### **_ Update: If you are running any business or doing freelance, check our new project [Gauzy](https://github.com/ever-co/gauzy) _**

#### !!! Hiring: remote TypeScript / NestJS / Angular developers. Send CV to jobs@ever.co !!!

[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/ever)
[![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/ever-co/ever?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/evereq?utm_source=github&utm_medium=button&utm_term=evereq&utm_campaign=github)

# Open-Source On-Demand Commerce Platform

[Ever](https://ever.co)® is an Open-Source, Real-Time, Reactive, **On-Demand** Commerce Platform built with [TypeScript](http://www.typescriptlang.org).

![overview](https://docs.ever.co/docs/assets/overview_small.png)

## Demos

-   [Admin Website](http://demo.ever.co:4200), use admin user email: `admin@ever.co`, password: `admin`
-   [Shopping Mobile App](http://demo.ever.co:4201)
-   [Merchant Ionic Tablet App](http://demo.ever.co:4202)
-   [Carrier Mobile App](http://demo.ever.co:4203)
-   [Shopping Website](http://demo.ever.co:3000)

## Features

-   Modern & Open Platform for **On-Demand Economy** and **Digital Marketplaces**
-   Supports Single-Store and Multi-Store / Multi-Vendor / Peer-to-Peer Marketplaces
-   Everything Reactive, Real-Time and Blazing Fast!
-   Headless Commerce framework, which allows different implementations of store-fronts, Admin UIs and client apps. It exposes rich GraphQL, REST and WS APIs.
-   Mobile ordering App for customers to make On-Demand orders (Hybrid / PWA, iOS and Android using Ionic / Ionic Native)
-   Carrier (Driver) Mobile App for deliveries by carriers, drivers or service providers (iOS and Android using Ionic / Ionic Native)
-   Customizing Shopping e-commerce Website for customers to make in-browser On-Demand purchases of food, goods or services
-   Merchant Tablet App for Stores/Merchants/Warehouses to manage & track orders, organize deliveries, etc.
-   Admin Website used to manage all platform features and settings in the single Web-based interface
-   Multi-language and culture settings across Platform (i18N)
-   Products Catalogs (global and per Merchant) with Multiple Product Images
-   Inventory/Stock Management and Real-time Order Management/Processing across the Platform
-   Deliveries/Shipping management and processing across Platform (shipping with real-time location tracking for On-Demand orders)
-   Real-Time discounts, promotions and products/services availability updates
-   Customers registration, Guest Checkouts, Invitations (optional)
-   Gateway and Payment Processing (currently supported Payments Gateway - [Stripe](https://stripe.com))
-   Plugins / Extensions / Custom Fields (WIP)

## Planned Features

-   Tax Calculations
-   Third-party Shipping providers integrations
-   Users Roles / Permissions across Platform
-   Large products catalogs with products variants, facets and full-text search

You can also track feature requests from the community in the [separate repo](https://github.com/ever-co/feature-requests/issues).

### Disclaimer

_A word of caution_: We are in α (alpha), i.e. Ever® Platform™ is very much under development (work in progress, WIP).  
Expect _lots_ of changes and some :bug: and please be nice! :stuck_out_tongue_winking_eye:

## Technology Stack and Requirements

-   [TypeScript](https://www.typescriptlang.org) language
-   [Node.js](https://nodejs.org)
-   [Ionic](https://ionicframework.com) (version 5) for Shopping Mobile App, Carrier Mobile App and Merchant Tablet App
-   Shopping Website developed with [Angular](https://angular.io) (version 9.1) using [Angular Starter](https://github.com/gdi2290/angular-starter)
-   Admin Website developed with [Angular](https://angular.io) (version 9.1) using [ngx-admin](https://github.com/akveo/ngx-admin)
-   Headless Commerce framework (Backend APIs/Server) developed using [Nest](https://github.com/nestjs/nest) with heavy use of our own Pyro module. Supports GraphQL, REST and WS Real-Time APIs (WebSockets using [Socket.io](https://socket.io) library)
-   [RxJS](http://reactivex.io/rxjs) library used heavy in every part of the Platform
-   [InversifyJS](http://inversify.io) used for Inversion Control / Dependency Injection in most parts of the Platform. On the Backend/API we also use DI provided by [Nest](https://github.com/nestjs/nest)
-   [MongoDB](https://www.mongodb.com) Database used with [Mongoose](https://mongoosejs.com) ORM (supported MongoDB version >= 3.2; we recommend version >=4)
-   We have ongoing effort (WIP) to add support for other databases using [TypeORM](https://github.com/typeorm/typeorm) and [Prisma](https://github.com/prisma/prisma). Following additional DBs will be fully supported: MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server and Oracle.
-   For production, we integrate and recommend to use [PM2](https://github.com/Unitech/pm2)

#### See also README.md and CREDITS.md files in relevant folders for lists of libraries and software included in the Platform, information about licenses and other details.

## Documentation

Please refer to our official [Platform Documentation](https://docs.ever.co) and to our [Wiki](https://github.com/ever-co/ever/wiki) (WIP).

For a quick overview of each project in the Platform (Server, Admin, Shops, etc.), you can search for README.md file in the root of the projects folders. For example, see [./backend/api/README.md](backend/api/README.md) for Server (Backend) related overview.

## Getting Started

We follow [Gitflow Workflow](https://nvie.com/posts/a-successful-git-branching-model), so the [`develop` branch](https://github.com/ever-co/ever/tree/develop) may be in an unstable or even broken state during development. Please use [releases](https://github.com/ever-co/ever/releases) or [`master` branch](https://github.com/ever-co/ever/tree/master) instead of the `develop` branch in order to get more stable code.

### Clone Repo

Clone the Ever Platform Git repo:

```
git clone https://github.com/ever-co/ever.git
```

**IMPORTANT NOTE:**

-   if you want to use develop branch (unstable, but latest development) clone using `--branch develop` (our default branch).
-   if you want to use release branch (more stable) clone using `--branch master`.

### Yarn

Currently, we are using `Yarn` (instead of `npm`), so make sure you have latest Yarn version installed before running Ever Platform:

```
npm install -g yarn@latest
```

### Quick installation

After git repo cloned, just run following command to install/bootstrap all dependencies:

```
yarn bootstrap
```

Above command install required packages in all Platform projects using Lerna.

Note: if above command fails for any reason, you can try to install required packages manually by running `yarn` inside every sub-folder of `packages` folder with 'package.json' file

### Build

You can build all projects in Ever Platform using single command below:

```
yarn build:all
```

Note: the parallel build available using `yarn build` command

### Lerna (manual installation)

We are using [Lerna](https://github.com/lerna/lerna) for mono-repo management.
You need to run the following command from the working folder where you cloned Ever git repo, which install Lerna together with other packages:

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

The command above install all required packages for every sub-project of the Ever Platform.

Note: if above command fails for any reason, you can try to install required packages manually by running `yarn` inside every sub-folder with 'package.json' file.

After Lerna boostrap everything you need to run build for all projecs as described above in the "Build" section.

### MongoDB

Ever platform configured to use MongoDB by default and assume you have MongoDB service running and accepting connections on the default `localhost:27017`. Please see relevant section in our [documentation](https://github.com/ever-co/ever/wiki/MongoDB).

### Platform Configuration

See relevant section in our [documentation](https://github.com/ever-co/ever/wiki/Ever-Platform-Configuration).

### Run Platform Projects

Finally, each project from Ever Platform could start by single command from this list:

-   Run API server `yarn run:server`
-   Run Admin Website `yarn run:admin` and open http://localhost:4200
-   Run Shopping Mobile App `yarn run:shopmobile` and open http://localhost:4201
-   Run Merchant Ionic Tablet App `yarn run:merchant` and open http://localhost:4202
-   Run Carrier Mobile app `yarn run:carrier` and open http://localhost:4203
-   Run Shopping Website `yarn run:shopweb` and open http://localhost:3000

Note 1: during development you can run server with `yarn run:server:dev` to enable watch on TS files changes

Note 2: on the first run, API Server (Backend) creates MongoDB local database `ever_development` with the following (default) Admin user

-   email: `admin@ever.co`
-   password: `admin`

You can use credentials above to login into Platform Admin App.

Note 3: in order to be able to run every project, you need to make sure everything builds, see section "Build" above.

## Metrics

According to [cloc](https://github.com/AlDanial/cloc) project, Ever Platform today has more than 120K lines of TypeScript, GraphQL, HTML / CSS and other code files. You can get more details in the relevant section of our [documentation](https://github.com/ever-co/ever/wiki/Metrics).

## Contribute

-   Please give us :star: on Github, it **helps**!
-   You are more than welcome to submit feature requests in the [separate repo](https://github.com/ever-co/feature-requests/issues)
-   Pull requests are always welcome! Please base pull requests against the _develop_ branch and follow the [contributing guide](.github/CONTRIBUTING.md).

## Collaborators and Contributors

### Development Team

#### Core

-   Ruslan Konviser ([Evereq](https://github.com/evereq))
-   Michael Konviser ([Komish](https://github.com/MrKomish))

#### Developers (alphabetical order)

-   Aleksandar Tasev ([AlexTasev](https://github.com/AlexTasev))
-   Alish Meklyov ([Alish](https://github.com/AlishMekliov931))
-   Blagovest Gerov ([BlagovestGerov](https://github.com/BlagovestGerov))
-   Boyan Stanchev ([boyanstanchev](https://github.com/boyanstanchev))
-   Elvis Arabadjiyski ([Dreemsuncho](https://github.com/Dreemsuncho))
-   Emil Momchilov ([jew-er](https://github.com/jew-er))
-   Hristo Hristov ([hrimar](https://github.com/hrimar))
-   Tsvetelina Yordanova ([tsvetelina-e-y](https://github.com/tsvetelina-e-y))
-   Yavor Grancharov ([YavorGrancharov](https://github.com/YavorGrancharov))

#### Designers & QA

-   [Julia Konviser](https://www.linkedin.com/in/julia-konviser-8b917552) (Graphic Designer, QA)

### Contributors

-   [Adem Hodzic](https://github.com/AdemHodzic)
-   [Deepak Chandwani](https://github.com/deepaksslibra)
-   [Kyle Kitlinski](https://github.com/K-Kit)
-   [Milena Dimova](https://www.linkedin.com/in/dimova-milena-31010414) (UI/UX Designer)
-   [Rachit Magon](https://github.com/rmagon)

View full list of our [contributors](https://github.com/ever-co/ever/graphs/contributors).

## Contact Us

-   [Discord Chat](https://discord.gg/msqRJ4w)
-   [Slack Community](https://join.slack.com/t/everplatform/shared_invite/enQtNzc2NzI1OTgwMjQwLTBkODI3OTU2ZDI1YTQwNWE3OGExYWUwYjE5NThkMjRiYjA0NmFiNzZhYWUzNWViNWI4Nzg2YTc3MzY2MjY0YzU)
-   [Spectrum Community](https://spectrum.chat/ever)
-   [Gitter Chat](https://gitter.im/ever-co/ever)
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

In a production setup, all client-side to server-side (backend, APIs) communications should be encrypted using HTTPS/WSS/SSL (REST APIs, GraphQL endpoint, Socket.io WebSockets, etc.).

## License

This software is available under following licenses:

-   [Ever® Platform Community™ Edition](https://github.com/ever-co/ever/blob/master/LICENSE.md#ever-platform-community-edition-license)
-   [Ever® Platform Small Business™](https://github.com/ever-co/ever/blob/master/LICENSE.md#ever-platform-small-business-license)
-   [Ever® Platform Enterprise™](https://github.com/ever-co/ever/blob/master/LICENSE.md#ever-platform-enterprise-license)

#### The default Ever® Platform™ license, without a valid Ever® Platform Enterprise™ or Ever® Platform Small Business™ License agreement, is the Ever® Platform Community™ Edition License.

#### Please see [LICENSE.md](LICENSE.md) for more information on licenses.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fever-co%2Fever.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fever-co%2Fever?ref=badge_large)

## Trademarks

**Ever**® is a registered trademark of [Ever Co. LTD](https://ever.co).  
**Ever® Platform™**, **Ever® Platform Community™**, **Ever® Platform Small Business™** and **Ever® Platform Enterprise™** are all trademarks of [Ever Co. LTD](https://ever.co).

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

#### **_ Update: If you are running any business or doing freelance, check our new project [Gauzy](https://github.com/ever-co/gauzy) _**

#### !!! Hiring: remote TypeScript / NestJS / Angular developers. Send CV to jobs@ever.co !!!
