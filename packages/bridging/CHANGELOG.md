# Changelog

## [0.3.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.3.1...sdk-bridging-v0.3.2) (2025-09-24)


### 🐛 Bug Fixes

* **bridge:** relax multi-quote errors wrapping ([#535](https://github.com/cowprotocol/cow-sdk/issues/535)) ([551f3d8](https://github.com/cowprotocol/cow-sdk/commit/551f3d899b125838101b7ba4214b37c2ceaf36ea))

## [0.3.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.3.0...sdk-bridging-v0.3.1) (2025-09-24)


### 🐛 Bug Fixes

* **bridge:** multi-quote strategies should not swallow BridgeProviderQuoteError ([#533](https://github.com/cowprotocol/cow-sdk/issues/533)) ([7789699](https://github.com/cowprotocol/cow-sdk/commit/77896999aa2140b70cd2919ede279eb7ebcf0b7b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.2.1
    * @cowprotocol/sdk-cow-shed bumped to 0.1.3
    * @cowprotocol/sdk-trading bumped to 0.1.3
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.3

## [0.3.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.2.0...sdk-bridging-v0.3.0) (2025-09-23)


### ✨ Features

* allow Bungee API custom base url and api key ([#517](https://github.com/cowprotocol/cow-sdk/issues/517)) ([a5cda81](https://github.com/cowprotocol/cow-sdk/commit/a5cda813d9f58a9e16393ab4eb1e350296fef2f8))
* **bridge:** add method to get best result from multiple providers ([#527](https://github.com/cowprotocol/cow-sdk/issues/527)) ([afd0005](https://github.com/cowprotocol/cow-sdk/commit/afd00053df4cbc4fdf9dcaa57ff0285d4e2af643))
* **bridge:** decompose BridgingSdk logic into strategies ([#528](https://github.com/cowprotocol/cow-sdk/issues/528)) ([be1a0f3](https://github.com/cowprotocol/cow-sdk/commit/be1a0f3d4995e6ac3ae929dd2b1aab3a6cbfd6c5))
* **bridge:** fallback to public endpoints in BungeeApi ([#529](https://github.com/cowprotocol/cow-sdk/issues/529)) ([b857aa7](https://github.com/cowprotocol/cow-sdk/commit/b857aa7cb8ee7a323e59922684549bdb734e374c))
* **bridge:** make multi-quote method progressive ([#526](https://github.com/cowprotocol/cow-sdk/issues/526)) ([27536c6](https://github.com/cowprotocol/cow-sdk/commit/27536c63ec91a26323ffb341c1edbef0ab9331a3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.2.0
    * @cowprotocol/sdk-cow-shed bumped to 0.1.2
    * @cowprotocol/sdk-trading bumped to 0.1.2
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.2

## [0.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.1.0...sdk-bridging-v0.2.0) (2025-09-22)


### ✨ Features

* **bridge:** support multi provider quote requests ([#518](https://github.com/cowprotocol/cow-sdk/issues/518)) ([36ed8f9](https://github.com/cowprotocol/cow-sdk/commit/36ed8f999d0b532b1a6e9c50c3152e3242dd333e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.1.1
    * @cowprotocol/sdk-cow-shed bumped to 0.1.1
    * @cowprotocol/sdk-trading bumped to 0.1.1
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.1

## [0.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.3.3-beta.0...sdk-bridging-v0.1.0) (2025-09-17)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.0.0
    * @cowprotocol/sdk-common bumped to 0.1.0
    * @cowprotocol/sdk-config bumped to 0.1.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.1.0
    * @cowprotocol/sdk-cow-shed bumped to 0.1.0
    * @cowprotocol/sdk-order-book bumped to 0.1.0
    * @cowprotocol/sdk-trading bumped to 0.1.0
    * @cowprotocol/sdk-weiroll bumped to 0.1.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.0

## [0.3.3-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.3.2-beta.0...sdk-bridging-v0.3.3-beta.0) (2025-09-17)


### 🔧 Miscellaneous

* make doc links absolute ([f03aabb](https://github.com/cowprotocol/cow-sdk/commit/f03aabb745e0cf51e3c9d5d8464f733e2668d544))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.7-beta.0
    * @cowprotocol/sdk-common bumped to 0.5.0-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.3.0-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.3.1-beta.0
    * @cowprotocol/sdk-trading bumped to 0.3.2-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.7-beta.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.2.8-beta.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.1-beta.0

## [0.3.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.3.1-beta.0...sdk-bridging-v0.3.2-beta.0) (2025-09-16)


### 🐛 Bug Fixes

* **bridge:** update bungee smart-contract address ([#506](https://github.com/cowprotocol/cow-sdk/issues/506)) ([f8e736a](https://github.com/cowprotocol/cow-sdk/commit/f8e736aafb6c3ca2c2020282e0f1af7ce6c0b5ac))

## [0.3.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.3.0-beta.0...sdk-bridging-v0.3.1-beta.0) (2025-09-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.6-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.2.1-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.7-beta.0
    * @cowprotocol/sdk-trading bumped to 0.3.1-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.6-beta.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.2.7-beta.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.4-beta.0

## [0.3.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.2.6-beta.0...sdk-bridging-v0.3.0-beta.0) (2025-09-16)


### ✨ Features

* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.5-beta.0
    * @cowprotocol/sdk-common bumped to 0.4.0-beta.0
    * @cowprotocol/sdk-config bumped to 0.3.3-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.2.0-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.6-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-trading bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.5-beta.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.2.6-beta.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0-beta.0

## [0.2.6-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.2.5-beta.0...sdk-bridging-v0.2.6-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.4-beta.0
    * @cowprotocol/sdk-config bumped to 0.3.2-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.7-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.6-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.4-beta.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.2.5-beta.0

## [0.2.5-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.2.4-beta.0...sdk-bridging-v0.2.5-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.3-beta.0
    * @cowprotocol/sdk-config bumped to 0.3.1-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.6-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.3-beta.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.2.4-beta.0

## [0.2.4-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.2.3-beta.0...sdk-bridging-v0.2.4-beta.0) (2025-09-15)


### 🐛 Bug Fixes

* **bridge:** fix applying affiliate header ([#492](https://github.com/cowprotocol/cow-sdk/issues/492)) ([e4f49c6](https://github.com/cowprotocol/cow-sdk/commit/e4f49c64e60f4aeac97b6b246c36090946df6fcf))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.5-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.4-beta.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.2.3-beta.0

## [0.2.3-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.2.2-beta.0...sdk-bridging-v0.2.3-beta.0) (2025-09-11)


### 🔧 Miscellaneous

* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.2-beta.0
    * @cowprotocol/sdk-common bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.4-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.2-beta.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.2-beta.0

## [0.2.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.2.1-beta.0...sdk-bridging-v0.2.2-beta.0) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.1-beta.0
    * @cowprotocol/sdk-config bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.3-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.1-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.1-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.1-beta.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.2.1-beta.0

## [0.2.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.2.0-beta.0...sdk-bridging-v0.2.1-beta.0) (2025-09-01)


### 🐛 Bug Fixes

* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))

## [0.2.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.1.0-beta.0...sdk-bridging-v0.2.0-beta.0) (2025-08-28)


### ✨ Features

* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **bridge:** add Bungee affiliate field ([aa32cc9](https://github.com/cowprotocol/cow-sdk/commit/aa32cc9bfdd8c0b3dd6d15e8485f2c089feec11b))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### 🐛 Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* **bridge:** increase gas for Gnosis bridge hook ([71b987d](https://github.com/cowprotocol/cow-sdk/commit/71b987d3a53d59aa0dad1fbdaaab36b0c77c72a7))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))


### 🔧 Miscellaneous

* fix main merge ([c1aa2b8](https://github.com/cowprotocol/cow-sdk/commit/c1aa2b81bd4e1b008b87a4207c8cf3358056ab1b))
* fix merge ([5c511de](https://github.com/cowprotocol/cow-sdk/commit/5c511deedd0c7821df6affefc9623c79a68c96c7))
* merge main 28-06-2025 ([#452](https://github.com/cowprotocol/cow-sdk/issues/452)) ([4c198ce](https://github.com/cowprotocol/cow-sdk/commit/4c198ce34890740bf0a0fe859620a9e1ad432bed))
* migrate latest changes from main 26-08-2025 ([#445](https://github.com/cowprotocol/cow-sdk/issues/445)) ([698937c](https://github.com/cowprotocol/cow-sdk/commit/698937c0feff3a254873371bc1ef791917e6294e))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
