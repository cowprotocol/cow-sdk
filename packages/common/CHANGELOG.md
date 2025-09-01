# Changelog

## [0.2.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-common-v0.2.0-beta.0...sdk-common-v0.2.1-beta.0) (2025-09-01)


### 🐛 Bug Fixes

* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))

## [0.2.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-common-v0.1.0-beta.0...sdk-common-v0.2.0-beta.0) (2025-08-28)


### ✨ Features

* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **cow-shed:** add estimateGas method to SignerAdapters ([fbb626a](https://github.com/cowprotocol/cow-sdk/commit/fbb626a0f88f6cb206432b4233b2d7d1e7cd4ad4))
* **cow-shed:** refact on common and contract-ts ([4be05aa](https://github.com/cowprotocol/cow-sdk/commit/4be05aa7a376fbc7d2ed5b2d2b6b68e3630b9c59))
* create common package with abstract adapter and context classes ([5e99f36](https://github.com/cowprotocol/cow-sdk/commit/5e99f36ddf1d8380a6ed136a51a7a1ecc4870396))
* enhance composable to test the 3 adapters ([7d1bd77](https://github.com/cowprotocol/cow-sdk/commit/7d1bd776b40a10808b9f6392dda862f610131169))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* refactor composable module to be framework-agnostic ([55032a2](https://github.com/cowprotocol/cow-sdk/commit/55032a2ca11d38d343f5f2c07c96b422671fa9e6))
* refactor contracts-ts ([2e14272](https://github.com/cowprotocol/cow-sdk/commit/2e14272f1a24a232aef584611924055ed657d16c))
* refactor contracts-ts ([b441360](https://github.com/cowprotocol/cow-sdk/commit/b4413600d4a0753e9f608e6a6415e64762a53d3e))
* refactor order-signing ([8e28d1b](https://github.com/cowprotocol/cow-sdk/commit/8e28d1bdbda9632347cacaae906298e736f4a7b3))
* **sdk-agnostic-lib:** create app data package ([#327](https://github.com/cowprotocol/cow-sdk/issues/327)) ([8b61261](https://github.com/cowprotocol/cow-sdk/commit/8b612615bc280dee2e5f4767794bc03f590d4764))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### 🐛 Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))


### ♻️ Refactoring

* move cow-error and wallets.ts and remove duplicate types ([4a7e5d6](https://github.com/cowprotocol/cow-sdk/commit/4a7e5d6d035ccebf05cce437f0409220f39b643a))


### 🔧 Miscellaneous

* add hashDomain to abstract utils ([f8692c1](https://github.com/cowprotocol/cow-sdk/commit/f8692c1c03b372076f785546d8f022be84206a1d))
* **cow-shed:** copy wallets.ts ([d187b04](https://github.com/cowprotocol/cow-sdk/commit/d187b0493acef0442288aad5265b63252f9d1674))
* fix lint and remove cow-sdk from lint. ([46decb7](https://github.com/cowprotocol/cow-sdk/commit/46decb72050c1b9481b24d9b10b6a4c4f2abe0c3))
* migrate latest changes from main 26-08-2025 ([#445](https://github.com/cowprotocol/cow-sdk/issues/445)) ([698937c](https://github.com/cowprotocol/cow-sdk/commit/698937c0feff3a254873371bc1ef791917e6294e))
* move constants to sdk-common ([c1336c3](https://github.com/cowprotocol/cow-sdk/commit/c1336c3af5dc51c649c9435919e5e1054a6f94d5))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
