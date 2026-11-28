# Open Commerce Platform

[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/ever-co/ever-demand)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/ever)
[![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/ever-co/ever?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/evereq?utm_source=github&utm_medium=button&utm_term=evereq&utm_campaign=github)

## 💡 What's New

- 🔥🔥🔥 we just released [Ever Works](https://github.com/ever-works/ever-works) - An open agentic runtime that autonomously researches, ships, and maintains entire businesses, 24/7. Please grab it now from <https://github.com/ever-works/ever-works> and make it ⭐⭐⭐ on GitHub!
- if you like Ever Demand, you should also check [Ever Gauzy](https://github.com/ever-co/ever-gauzy) - Open Business Management Platform (ERP/CRM/HRM/ATS/PM). Please check <https://github.com/ever-co/ever-gauzy> and make it ⭐ on GitHub!

## 🌟 What is it

[Ever® Demand™](https://ever.co) - Open Platform for **Collaborative**, **On-Demand** and **Sharing** **Economies**.  

It's an Open-Source, Real-Time, and Reactive Platform built with [TypeScript](http://www.typescriptlang.org).  
You are welcome to check more information about the platform at our official website - **<https://ever.co>**.

![overview](https://docs.ever.co/overview_small.png)

## 💻 Demos

**Demos are not available at the moment as we are moving to Kubernetes and showdown old demo server!**

<!---

-   [Admin Website](http://demo.ever.co:4200), use admin user email: `admin@ever.co`, password: `admin`
-   [Shopping Mobile App](http://demo.ever.co:4201)
-   [Merchant Ionic Tablet App](http://demo.ever.co:4202)
-   [Carrier Mobile App](http://demo.ever.co:4203)
-   [Shopping Website](http://demo.ever.co:3000)

-->

## Video Intros

- Introduction of both Ever Demand and Ever Gauzy platforms - [view video](https://www.loom.com/share/ff9a9b1fa3a849cca5cf68a6d502443b) (~30 min) or [download](https://media.githubusercontent.com/media/ever-co/ever-demand-docs/master/docs/assets/videos/EverDemandAndGauzyIntro.mp4)
- Introduction to Ever Demand Mobile Shop customer experience (UX) - [view video](https://www.loom.com/share/488f774e6b6d4ee88107443ce4522f1f) (~30 min) or [download](https://media.githubusercontent.com/media/ever-co/ever-demand-docs/master/docs/assets/videos/EverDemandMobileShopIntro.mp4)

## ✨ Features

### Current Features

-   Supports Single-Store and Multi-Store / Multi-Vendor / Peer-to-Peer / Digital Marketplaces
-   Everything Reactive, Real-Time, and Blazing Fast!
-   Headless Commerce framework, which allows different implementations of store-fronts, Admin UIs, and client apps. It exposes rich GraphQL, REST, and WS APIs.
-   Mobile ordering App for customers to make On-Demand orders (Hybrid / PWA, iOS and Android using Ionic / Ionic Native)
-   Carrier (Driver) Mobile App for deliveries by carriers, drivers, or service providers (iOS and Android using Ionic / Ionic Native)
-   Customizing Shopping e-commerce Website for customers to make in-browser On-Demand purchases of food, goods or services
-   Merchant Tablet App for Stores/Merchants/Warehouses to manage & track orders, organize deliveries, etc.
-   Admin Website used to manage all platform features and settings in the single Web-based interface
-   Multi-language and culture settings across Platform (i18N)
-   Product catalogs (global and per Merchant) with Multiple Product Images
-   Inventory/Stock Management and Real-time Order Management/Processing across the Platform
-   Deliveries/Shipping management and processing across the Platform (shipping with real-time location tracking for On-Demand orders)
-   Real-time discounts, promotions, and product/service availability updates
-   Customer registration, Guest Checkouts, Invitations (optional)
-   Gateway and Payment Processing (currently supported Payments Gateway - [Stripe](https://stripe.com))
-   Plugins / Extensions / Custom Fields (WIP)

### Planned Features

-   Tax Calculations
-   Third-party Shipping provider integrations
-   User Roles / Permissions across Platform
-   Large product catalogs with product variants, facets, and full-text search

You can also track feature requests from the community in the [separate repo](https://github.com/ever-co/feature-requests/issues).

### Disclaimer

_A word of caution_: We are in α (alpha), i.e. Ever® Platform™ is very much under development (work in progress, WIP).
Expect _lots_ of changes and some :bug: and please be nice! :stuck_out_tongue_winking_eye:

## 🧱 Technology Stack and Requirements

-   Full-stack [TypeScript](https://www.typescriptlang.org) - frontends and [NodeJs](https://nodejs.org)/[Nest](https://github.com/nestjs/nest) backend.
-   Headless Commerce framework (Backend APIs/Server) developed using [Nest](https://github.com/nestjs/nest). Supports GraphQL, REST and WS Real-Time APIs (WebSockets using [Socket.io](https://socket.io) library).
-   [Ionic](https://ionicframework.com) (version 9) with [Capacitor](https://capacitorjs.com) (version 8) for Carrier Mobile App and Merchant Tablet App.
-   Shopping Mobile App built with [Ionic](https://ionicframework.com) (version 9) and [Capacitor](https://capacitorjs.com) (version 8).
-   Shopping Mobile App built with [React Native](https://github.com/facebook/react-native) using [Expo](https://github.com/expo/expo) (SDK 58), with the same features as the Ionic shopping app.
-   Shopping Mobile App built with [Flutter](https://github.com/flutter/flutter) / Dart 3, with the same features as the Ionic shopping app.
-   Shopping Website developed with [Angular](https://angular.dev) (version 22) with Angular Material.
-   Admin Website developed with [Angular](https://angular.dev) (version 22) using [ngx-admin](https://github.com/akveo/ngx-admin) / [Nebular](https://akveo.github.io/nebular) (version 17).
-   [RxJS](http://reactivex.io/rxjs) library used heavily in every part of the Platform.
-   [InversifyJS](http://inversify.io) used for Inversion Control / Dependency Injection in most parts of the Platform. On the Backend/API we also use DI provided by [Nest](https://github.com/nestjs/nest).
-   [MongoDB](https://www.mongodb.com) Database used with [Mongoose](https://mongoosejs.com) ORM (Mongoose 9; MongoDB 7 or newer, we test with MongoDB 8).
-   We have an ongoing effort (WIP) to add support for other databases using [TypeORM](https://github.com/typeorm/typeorm) and [Prisma](https://github.com/prisma/prisma). The following additional DBs will be fully supported: MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, and Oracle.
-   For production, every app ships as a Docker image (`.deploy/*/Dockerfile`): the API runs as a plain `node` process (no process manager; restarts are the orchestrator's job, e.g. Kubernetes), and the web apps are static builds served by nginx.

#### See also README.md and CREDITS.md files in relevant folders for lists of libraries and software included in the Platform, information about licenses and other details.

## 📄 Documentation

Please refer to our official [Platform Documentation](https://docs.ever.co) and to our [Wiki](https://github.com/ever-co/ever-demand/wiki) (WIP).

For a quick overview of each project in the Platform (Server, Admin, Shops, etc.), you can search for the README.md file in the root of the project's folders. For example, see [./backend/api/README.md](backend/api/README.md) for Server (Backend) related overview.

## 📊 Activity

![Alt](https://repobeats.axiom.co/api/embed/4e666433c785034fea1712b91f5f7d09ed009385.svg "Repobeats analytics image")

## 🚀 Getting Started

We follow [Gitflow Workflow](https://nvie.com/posts/a-successful-git-branching-model), so the [`develop` branch](https://github.com/ever-co/ever-demand/tree/develop) may be in an unstable or even broken state during development. Please use [releases](https://github.com/ever-co/ever/releases) or [`master` branch](https://github.com/ever-co/ever-demand/tree/master) instead of the `develop` branch in order to get more stable code.

### Clone Repo

Clone the Ever Platform Git repo:

```
git clone https://github.com/ever-co/ever-demand.git
```

**IMPORTANT NOTE:**

-   If you want to use a develop branch (unstable, but latest development) clone using `--branch develop` (our default branch).
-   If you want to use a release branch (more stable) clone use `--branch master`.

### Requirements

-   [Node.js](https://nodejs.org) 26 (see `.nvmrc`)
-   [pnpm](https://pnpm.io) 12: `npm install -g pnpm@12`
-   A MongoDB-compatible database, either one of:
    -   [MongoDB](https://www.mongodb.com) 7 or newer (8 recommended), e.g. `docker run -d -p 27017:27017 mongo:8`;
    -   [DocumentDB](https://github.com/documentdb/documentdb) 1.2 or newer: MongoDB-compatible, stores the data in PostgreSQL. See [docs/deployment/documentdb.md](docs/deployment/documentdb.md).
-   For the Flutter app: the [Flutter](https://flutter.dev) stable SDK, or Docker (see `packages/shop-mobile-flutter/README.md`)

### Install

From the folder where you cloned the repo, install every package of the workspace (pnpm workspaces; `pnpm-workspace.yaml` lists the packages):

```
pnpm install
```

### Build

```
pnpm run build:common   # shared code; needed before the API or any app
pnpm run build:all      # API + all Angular / Ionic apps
```

Each app also has its own script, e.g. `pnpm run build:admin`, `pnpm run build:shopmobile`, `pnpm run build:shopexpo`.

### Test

```
pnpm run typecheck
pnpm run test           # unit tests of every package (Jest for the API, Vitest for the Angular apps, Jest for Expo)
pnpm run e2e            # Playwright e2e (needs the API and the apps running, see e2e/playwright.config.ts)
```

The API also has its own e2e suite against a real MongoDB: `pnpm --filter @ever-platform/core test:e2e`.

### Database: MongoDB or DocumentDB

The API connects to the database in `DB_URI` (`packages/core/.env`). By default that is MongoDB on `localhost:27017` (`mongodb://localhost/ever_development`); see also the [MongoDB wiki page](https://github.com/ever-co/ever-demand/wiki/MongoDB).

Ever Demand also runs on [DocumentDB](https://github.com/documentdb/documentdb), the open-source MongoDB-compatible database built on PostgreSQL (MIT, Linux Foundation). Use it if you would rather operate PostgreSQL than MongoDB. The full API and Playwright e2e suites pass on DocumentDB 1.2 exactly as on MongoDB 8.

- **Local:** `DOCUMENTDB_PASSWORD=<a password> docker compose -f docker-compose.yml -f docker-compose.documentdb.yml up`
- **Connection:** `DB_URI=mongodb://<host>:10260/<database>?tls=true` plus `DB_NAME`, `DB_USER`, `DB_PASS`. Use TLS, and start the gateway with `--tlsMode requireTLS` in production.
- **Production:** give DocumentDB its own PostgreSQL, never one shared with other apps.

Setup, differences and the test results are in [docs/deployment/documentdb.md](docs/deployment/documentdb.md).

### Platform Configuration

Every package reads its settings from environment variables; see the `.env.template` file in each package (for the API: `packages/core/.env.template`).
In production the API requires `JWT_SECRET` and `EXPRESS_SESSION_SECRET` (long random values) and `ADMIN_PASSWORD` for the first admin; keep secrets in a secret store (OpenBao, GitHub secrets, k8s Secrets), never in the repo or the images.
See also the relevant section in our [documentation](https://github.com/ever-co/ever-demand/wiki/Ever-Platform-Configuration).

### Run Platform Projects

-   Run API server `pnpm run:server` (or `pnpm run:server:dev` to rebuild on TS file changes)
-   Run Admin Website `pnpm run:admin` and open http://localhost:4200
-   Run Shopping Mobile App (Ionic) `pnpm run:shopmobile` and open http://localhost:4201
-   Run Merchant Ionic Tablet App `pnpm run:merchant` and open http://localhost:4202
-   Run Carrier Mobile app `pnpm run:carrier` and open http://localhost:4203
-   Run Shopping Website `pnpm run:shopweb` and open http://localhost:3000
-   Run Shopping Mobile App (React Native / Expo) `pnpm run:shopexpo`
-   Run Shopping Website (Gatsby) `pnpm run:shopgatsby`
-   Run Shopping Mobile App (Flutter): see `packages/shop-mobile-flutter/README.md`

The Ionic apps use [Capacitor](https://capacitorjs.com) for native builds: run `npx cap add android` (or `ios`) once inside the app folder, then `npx cap sync` after each web build.

On the first run, the API Server (Backend) creates the MongoDB database `ever_development` with the following (default) Admin user (outside production; in production set `ADMIN_EMAIL` / `ADMIN_PASSWORD`):

-   email: `admin@ever.co`
-   password: `admin`

You can use the credentials above to login into Platform Admin App.

## Metrics

According to [cloc](https://github.com/AlDanial/cloc) project, Ever Platform today has more than 120K lines of TypeScript, GraphQL, HTML / CSS and other code files. You can get more details in the relevant section of our [documentation](https://github.com/ever-co/ever-demand/wiki/Metrics).

## 💌 Contact Us

-   [Ever.co Website Contact Us page](https://ever.co/contacts)
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

## 🔐 Security

Ever® Demand™ Platform follows good security practices, but 100% security cannot be guaranteed in any software!
Ever® Demand™ Platform is provided AS IS without any warranty. Use at your own risk!
See more details in the [LICENSE.md](LICENSE.md).

In a production setup, all client-side to server-side (backend, APIs) communications should be encrypted using HTTPS/WSS/SSL (REST APIs, GraphQL endpoint, Socket.io WebSockets, etc.).

If you discover any issue regarding security, please disclose the information responsibly by sending an email to <mailto:security@ever.co> or on [![huntr](https://cdn.huntr.dev/huntr_security_badge_mono.svg)](https://huntr.dev) and not by creating a GitHub issue.

## 🛡️ License

We support the open-source community. If you're building awesome non-profit/open-source projects, we're happy to help and will provide (subject to [acceptance criteria](https://github.com/ever-co/ever-demand/wiki/Free-license-and-hosting-for-Non-profit-and-Open-Source-projects)) Ever Demand Enterprise edition license and free hosting option! Feel free to contact us at <mailto:ever@ever.co> to make a request. More details are explained in our [Wiki](https://github.com/ever-co/ever-demand/wiki/Free-license-and-hosting-for-Non-profit-and-Open-Source-projects).

This software is available under the following licenses:

-   [Ever® Demand™ Platform Community Edition](https://github.com/ever-co/ever-demand/blob/master/LICENSE.md#ever-platform-community-edition-license)
-   [Ever® Demand™ Platform Small Business](https://github.com/ever-co/ever-demand/blob/master/LICENSE.md#ever-platform-small-business-license)
-   [Ever® Demand™ Platform Enterprise](https://github.com/ever-co/ever-demand/blob/master/LICENSE.md#ever-platform-enterprise-license)

#### The default Ever® Demand™ Platform license, without a valid Ever® Demand™ Platform Enterprise or Ever® Demand™ Platform Small Business License agreement, is the Ever® Demand™ Platform Community Edition License.

#### Please see [LICENSE.md](LICENSE.md) for more information on licenses. You can also [compare our offering](https://ever.co/compare-ever/#compare).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fever-co%2Fever.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fever-co%2Fever?ref=badge_large)

## Trademarks

**Ever**® is a registered trademark of [Ever Co. LTD](https://ever.co).
**Ever® Demand™**, **Ever® Gauzy™** and **Ever® OpenSaaS™** are all trademarks of [Ever Co. LTD](https://ever.co).

The trademarks may only be used with the written permission of Ever Co. LTD. and may not be used to promote or otherwise market competitive products or services.

All other brand and product names are trademarks, registered trademarks, or service marks of their respective holders.

## 🍺 Contribute

-   Please give us :star: on Github, it **helps**!
-   You are more than welcome to submit feature requests in the [separate repo](https://github.com/ever-co/feature-requests/issues)
-   Pull requests are always welcome! Please base pull requests against the _develop_ branch and follow the [contributing guide](.github/CONTRIBUTING.md).

## 💪 Thanks to our Contributors

See our contributors list in [CONTRIBUTORS.md](https://github.com/ever-co/ever-demand/blob/develop/.github/CONTRIBUTORS.md).  
You can also view a full list of our [contributors tracked by Github](https://github.com/ever-co/ever-demand/graphs/contributors).

<img src="https://contributors-img.web.app/image?repo=ever-co/ever-demand" />

## ⭐ Star History

[![Star History Chart](https://stats-github.ever.co/svg?repos=ever-co/ever-demand&type=Date)](https://stats-github.ever.co/#ever-co/ever-demand&Date)

## ❤️ Powered By

<p>
  <a href="https://www.digitalocean.com/?utm_medium=opensource&utm_source=ever-co">
    <img src="https://opensource.nyc3.cdn.digitaloceanspaces.com/attribution/assets/PoweredByDO/DO_Powered_by_Badge_blue.svg" width="201px">
  </a>
</p>

## ©️ Copyright

#### Copyright © 2016-present, Ever Co. LTD. All rights reserved.

---

![visitors](https://visitor-badge.laobi.icu/badge?page_id=ever-co.ever-platform)
[![huntr](https://cdn.huntr.dev/huntr_security_badge_mono.svg)](https://huntr.dev)
[![Circle CI](https://circleci.com/gh/ever-co/ever-demand.svg?style=svg)](https://circleci.com/gh/ever-co/ever-demand)
[![codecov](https://codecov.io/gh/ever-co/ever-demand/branch/master/graph/badge.svg)](https://codecov.io/gh/ever-co/ever-demand)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ec4b3c9e71ff42919563f1809de4e601)](https://www.codacy.com/gh/ever-co/ever-demand/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ever-co/ever-demand&amp;utm_campaign=Badge_Grade)
[![DeepScan grade](https://deepscan.io/api/teams/3293/projects/4849/branches/38566/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=3293&pid=4849&bid=38566)
[![Known Vulnerabilities](https://snyk.io/test/github/ever-co/ever-demand/badge.svg)](https://snyk.io/test/github/ever-co/ever-demand)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/ever-co/ever-demand.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/ever-co/ever-demand/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/ever-co/ever-demand.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/ever-co/ever-demand/context:javascript)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fever-co%2Fever-demand.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fever-co%2Fever-demand?ref=badge_shield)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io)
[![Crowdin](https://badges.crowdin.net/e/581540ddcc7c1cf42a50d0e0a6a3d7f7/localized.svg)](https://ever.crowdin.com/ever)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/ever-co/ever-demand?utm_source=oss&utm_medium=github&utm_campaign=ever-co%2Fever-demand&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## 🔥 P.S.

-   If you are running any business or doing freelance, check our new project [Ever Gauzy](https://github.com/ever-co/ever-gauzy) - Open Business Management Platform (ERP/CRM/HRM)
-   [We are Hiring: remote TypeScript / NodeJS / NestJS / Angular & React developers](https://github.com/ever-co/jobs#available-positions)
