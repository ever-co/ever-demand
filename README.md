# Ever - Open-Source On-Demand Commerce Platform

[![Circle CI](https://circleci.com/gh/ever-co/ever.svg?style=svg)](https://circleci.com/gh/ever-co/ever)
[![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/ever-co/ever?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![codecov](https://codecov.io/gh/ever-co/ever/branch/master/graph/badge.svg)](https://codecov.io/gh/ever-co/ever)

<!---[![Known Vulnerabilities](https://snyk.io/test/github/ever-co/ever/badge.svg)](https://snyk.io/test/github/ever-co/ever)--->

[Ever](https://ever.co)® is an Open-Source, Real-Time, Reactive, **On-Demand** Commerce Platform build with TypeScript.

Out-of-the-box Ever Platform provides everything required to quickly build Multi-Store (Marketplace) or Single-Store **On-Demand** Platform with customized e-commerce Websites (shops), Mobile ordering apps, Carrier (Driver) apps, Merchant apps and Admin website.

So, if you need to build next "Uber for X", Ever Platform is your right choice!

#### NOTE: We are in α (alpha). Expect lots of changes and please be nice! ;)

## Features

- Open Platform (every part is Open-Source!)
- Shopping Mobile App for customers to make On-Demand orders (iOS and Android using Ionic / Ionic Native)
- Carrier Mobile App for carriers, drivers or delivery service providers (iOS and Android using Ionic / Ionic Native)
- Shopping e-commerce Website for customers to make in-browser On-Demand purchases of food, goods or services
- Merchant Tablet App used by Stores/Merchants/Warehouses to manage & track orders, organize deliveries, etc.
- Admin Website used to manage all platform features and settings in the single Web-based interface
- Multi-language and culture settings accross (i18N) Platform
- Products Catalogs (global and per Merchant) with Multiple Product Images
- Inventory Management and Real-time Order Management accross Platform
- Deliveries processing accross Platform (shipping with real-time location tracking)
- Real-Time discounts, promotions and products/services availability updates
- Payments (currently supported Payments Gateway - [Stripe](https://stripe.com))

## Technology Stack and Requirements

- Almost every part of the Platform developed using [TypeScript](https://www.typescriptlang.org) language (>=2.9)
- Most of projects require [Node.js](https://nodejs.org) (>=8)
- Shopping Mobile App developed using [Ionic](https://ionicframework.com) v4
- Carrier Mobile App developed using [Ionic](https://ionicframework.com) v3
- Shopping Website developed with [Angular](https://angular.io) 6 using [Angular Starter](https://github.com/gdi2290/angular-starter)
- Merchant Tablet App developed using [Ionic](https://ionicframework.com) v3
- Admin Website developed with [Angular](https://angular.io) 6 using [ngx-admin](https://github.com/akveo/ngx-admin)
- Backend Api (Server) developed using [Nest](https://github.com/nestjs/nest) with heavy use of our own Pyro module. We support both REST and GraphQL APIs. Real-Time communications use [Socket.io](https://socket.io)
- We use [RxJS](http://reactivex.io/rxjs) library heavy in every part of the Platform
- [InversifyJS](http://inversify.io) used for Inversion Control / Dependency Injection in some parts of the Platform
- [MongoDB](https://www.mongodb.com) (>= 3.2) Database used with [Mongoose](https://mongoosejs.com) ORM
- For production, we integrate and recommend to use [PM2](https://github.com/Unitech/pm2)

#### See also README.md and CREDITS.md files in relevant folders for lists of libraries and software included in the Platform, information about licenses and other details.

## Getting Started

Clone Ever platform Git repo with all required sub-modules

```
git clone -c core.symlinks=true --recursive git@github.com:ever-co/ever.git
```

If you use Git >= v2.14, it makes sense to setup following:

```
git config --global submodule.recurse true
```

(for older Git versions see https://stackoverflow.com/questions/4611512/is-there-a-way-to-make-git-pull-automatically-update-submodules/4611550#4611550)

We are using Lerna (https://github.com/lerna/lerna), so you may want to install it globally (recommended):
```
npm install lerna@latest -g
```

Next you need to Bootstrap all dependencies:
```
yarn bootstrap
```

Finally, each project from Ever Platform can be started by single command from this list:
```
 yarn run:server # Run API server
 yarn run:admin # Run Admin Website
 yarn run:merchant # Run Merchant Ionic Tablet App
 yarn run:shopmobile # Run Shopping Mobile App
 yarn run:shopweb # Run Shopping Website
 yarn run:carrier # Run Carrier Mobile app
```

## Contribute

- Please give us :star: on Github, it **really** helps!
- You are more than welcome to submit feature requests in the separate repo: [https://github.com/ever-co/feature-requests/issues](https://github.com/ever-co/feature-requests/issues)

## Contact Us

- [Ever Platform Gitter Chat](https://gitter.im/ever-co/ever)
- For business inquiries: <mailto:ever@ever.co>
- Please report security vulnerabilities to <mailto:security@ever.co>

## License

Different parts of the Platform are made available under the terms of the separate licenses

- Shopping Mobile App and Carrier Mobile App - [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.txt)
- Shopping Website - [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
- Merchant Tablet App and Merchant Website - [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
- Admin Website - [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
- Backend Api (Server) - [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
- Pyro shared modules - [MIT License](https://opensource.org/licenses/MIT)
- Other shared modules - [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.txt)

#### See also individual files and LICENSE.md files in corresponding sub-folders for more licenses related details.

## Trademarks

**Ever**® is a registered trademark of [Ever Co. LTD](https://ever.co).  
All other brand and product names are trademarks, registered trademarks or service marks of their respective holders.

#### Copyright © 2016-2018, Ever Co. LTD. All rights reserved.
