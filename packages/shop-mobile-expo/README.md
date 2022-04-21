# @ever-platform/shop-mobile-expo

> 🛑 **NOT YET COMPATIBLE**: Currently this package don't works fine with Lerna mono-repo logic.
> To be able to run this package locally, you've to extract the package outside of @ever-platform and then install dependencies (see [setup](#-setup) section).
> But this package depend on @ever-platform server, don't forget to start the api...

## 📋 Contents

-   [Contents](#-contents)
-   [Demo](#-demo)
-   [Setup](#-setup)
-   [Testing](#-testing)
-   [Contribution](#-contribution)

## 🤳 Demo

> We used expo to test our application easily and quickly.
> So you must first install expo on your mobile and then test the demo version.

Copy that link -> **[https://exp.host/@everco/ever-demand-shop-mobile-expo](https://exp.host/@everco/ever-demand-shop-mobile-expo)** and past it into your expo app to preview demo.

## ⚡ Setup

<!-- TODO: Add more folders and files descriptions -->

### 📋 Package structure

    .
    ├── .expo-shared
    ├── script
    ├── src
      ├── assets # Contain app assets (imgs, fonts, ...)
      ├── client # Contain ApolloGraphQL queries, mutations and relative types
      ├── components # Contain components used in the app
      ├── constants
      ├── helpers # Class/Functions that provides useful feature
      ├── environments
      ├── router
      ├── screens
      ├── store
      ├── types # Contain global types
      └── App.tsx
    ├── .env.template
    ├── .eslintrc.json
    ├── .gitignore
    ├── .prettierrc.json
    ├── .watchmanconfig
    ├── app.json
    ├── App.spec.tsx
    ├── App.tsx
    ├── babel.config.js
    ├── metro.config.js
    ├── package.json
    ├── README.md
    └── tsconfig.json

### 🌟 Before install

**🚧 Before installing et running project locally, make sure you have :**

-   The latest Yarn version installed in your computer **(note that we're only use Yarn)**
-   Node.js V14.x.x or higher installed in your computer
-   Expo 5.x.x or higher installed in your computer
-   The latest version of expo app installed in your phone (or virtual device)

### ⚡ Installation & Running

-   Install dependencies `Yarn`. run `yarn add`.
-   Create environment files by running `yarn run config`.
-   After these steps, run `yarn run start` command to start bundle server

> 🚧 If you can't connect to the server, maybe the endpoint aren't compatible.
> To update them, got to `./src/environments/environment.ts` and change urls props into `ENDPOINT` prop from `http://localhost/...` to `<http://10.0.2.2/>...

<!--  -->

> 💡 If you still can't connect to the API, we recommend that you consult the wiki where we explain how to expose your local network: <https://github.com/ever-co/ever-demand/wiki/Expose-Local-Network>

## 🧪 Testing

We're using Jest to test our application.

To run all tests, run `yarn run test`

### 🤝 Contribution

Please refer to the [guide of the platform](https://github.com/ever-co/ever-demand/#contribute)
