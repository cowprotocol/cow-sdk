# Changelog

## [0.6.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.5.0...sdk-contracts-ts-v0.6.0) (2025-11-24)


### ✨ Features

* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.4.0
    * @cowprotocol/sdk-config bumped to 0.4.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0

## [0.5.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.4.4...sdk-contracts-ts-v0.5.0) (2025-11-07)


### ✨ Features

* **flash-loans:** support Mainnet, Gnosis, and Base for AAVE ([#657](https://github.com/cowprotocol/cow-sdk/issues/657)) ([c7f2327](https://github.com/cowprotocol/cow-sdk/commit/c7f2327f4672a899c2775dd8ab8d3543ad08cdd6))

## [0.4.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.4.3...sdk-contracts-ts-v0.4.4) (2025-11-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.0

## [0.4.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.4.2...sdk-contracts-ts-v0.4.3) (2025-10-30)


### 🐛 Bug Fixes

* flashloan fee calculation now matches aave's ([#622](https://github.com/cowprotocol/cow-sdk/issues/622)) ([8d11b7f](https://github.com/cowprotocol/cow-sdk/commit/8d11b7fbbc8ff797253f26772a0e5c940286f2d9))

## [0.4.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.4.1...sdk-contracts-ts-v0.4.2) (2025-10-29)


### 🔧 Miscellaneous

* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.0

## [0.4.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.4.0...sdk-contracts-ts-v0.4.1) (2025-10-24)


### 🐛 Bug Fixes

* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.2
    * @cowprotocol/sdk-config bumped to 0.2.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.3

## [0.4.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.3.1...sdk-contracts-ts-v0.4.0) (2025-10-15)


### ✨ Features

* **trading:** add validTo parameter to getQuote ([#576](https://github.com/cowprotocol/cow-sdk/issues/576)) ([fcf4258](https://github.com/cowprotocol/cow-sdk/commit/fcf425806044c0ea8b83cfb4116d2f7fb9fcc6e0))


### 🐛 Bug Fixes

* **app-data:** fix typos and ids in schemas ([#586](https://github.com/cowprotocol/cow-sdk/issues/586)) ([5a4461a](https://github.com/cowprotocol/cow-sdk/commit/5a4461a2a171689db04f7c805c9e2c835bbd36dd))

## [0.3.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.3.0...sdk-contracts-ts-v0.3.1) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.2

## [0.3.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.2.1...sdk-contracts-ts-v0.3.0) (2025-10-06)


### ✨ Features

* **trading:** use suggested slippage from BFF ([#546](https://github.com/cowprotocol/cow-sdk/issues/546)) ([b6a59c7](https://github.com/cowprotocol/cow-sdk/commit/b6a59c780fbfb0f2e840276fe905b2efd810805c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.1

## [0.2.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.2.0...sdk-contracts-ts-v0.2.1) (2025-09-24)


### 🐛 Bug Fixes

* **bridge:** multi-quote strategies should not swallow BridgeProviderQuoteError ([#533](https://github.com/cowprotocol/cow-sdk/issues/533)) ([7789699](https://github.com/cowprotocol/cow-sdk/commit/77896999aa2140b70cd2919ede279eb7ebcf0b7b))

## [0.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.1.1...sdk-contracts-ts-v0.2.0) (2025-09-23)


### ✨ Features

* **bridge:** make multi-quote method progressive ([#526](https://github.com/cowprotocol/cow-sdk/issues/526)) ([27536c6](https://github.com/cowprotocol/cow-sdk/commit/27536c63ec91a26323ffb341c1edbef0ab9331a3))

## [0.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v0.1.0...sdk-contracts-ts-v0.1.1) (2025-09-22)


### 🐛 Bug Fixes

* avoid using adapter in normalizeOrder ([#523](https://github.com/cowprotocol/cow-sdk/issues/523)) ([7c196c3](https://github.com/cowprotocol/cow-sdk/commit/7c196c39a6694924cbec09f159dd237da39d73a2))

## [0.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.3.0-beta.0...sdk-contracts-ts-v0.1.0) (2025-09-17)


### ⚠ BREAKING CHANGES

* release cow-sdk v7 ([#514](https://github.com/cowprotocol/cow-sdk/issues/514))

### ✨ Features

* release cow-sdk v7 ([#514](https://github.com/cowprotocol/cow-sdk/issues/514)) ([01ebd43](https://github.com/cowprotocol/cow-sdk/commit/01ebd437bd0d54d601a3f00f3ebd2bffd58f7a93))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.1.0
    * @cowprotocol/sdk-config bumped to 0.1.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.0

## [2.3.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.2.1-beta.0...sdk-contracts-ts-v2.3.0-beta.0) (2025-09-17)


### ✨ Features

* **cow-shed:** validate EIP1271 signature ([#508](https://github.com/cowprotocol/cow-sdk/issues/508)) ([5c72123](https://github.com/cowprotocol/cow-sdk/commit/5c7212323edcea3eadf70973f765619afb1bcaf4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.0-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.1-beta.0

## [2.2.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.2.0-beta.0...sdk-contracts-ts-v2.2.1-beta.0) (2025-09-16)


### 🐛 Bug Fixes

* rename ether to ethers ([#504](https://github.com/cowprotocol/cow-sdk/issues/504)) ([eaf2705](https://github.com/cowprotocol/cow-sdk/commit/eaf2705f269352d3bc2908eb3335ff56ef426823))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.4-beta.0

## [2.2.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.1.7-beta.0...sdk-contracts-ts-v2.2.0-beta.0) (2025-09-16)


### ✨ Features

* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.4.0-beta.0
    * @cowprotocol/sdk-config bumped to 0.3.3-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0-beta.0

## [2.1.7-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.1.6-beta.0...sdk-contracts-ts-v2.1.7-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.2-beta.0

## [2.1.6-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.1.5-beta.0...sdk-contracts-ts-v2.1.6-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.1-beta.0

## [2.1.5-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.1.4-beta.0...sdk-contracts-ts-v2.1.5-beta.0) (2025-09-15)


### 🐛 Bug Fixes

* **bridge:** fix applying affiliate header ([#492](https://github.com/cowprotocol/cow-sdk/issues/492)) ([e4f49c6](https://github.com/cowprotocol/cow-sdk/commit/e4f49c64e60f4aeac97b6b246c36090946df6fcf))

## [2.1.4-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.1.3-beta.0...sdk-contracts-ts-v2.1.4-beta.0) (2025-09-11)


### 🔧 Miscellaneous

* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.2-beta.0

## [2.1.3-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.1.2-beta.0...sdk-contracts-ts-v2.1.3-beta.0) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.0-beta.0

## [2.1.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.1.1-beta.0...sdk-contracts-ts-v2.1.2-beta.0) (2025-09-04)


### 🔧 Miscellaneous

* bump sdk beta version ([#473](https://github.com/cowprotocol/cow-sdk/issues/473)) ([00142d3](https://github.com/cowprotocol/cow-sdk/commit/00142d3e524ebf7a023814ba91ee3a66ed796444))

## [2.1.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.1.0-beta.0...sdk-contracts-ts-v2.1.1-beta.0) (2025-09-01)


### 🐛 Bug Fixes

* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))

## [2.1.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.0.0-beta.0...sdk-contracts-ts-v2.1.0-beta.0) (2025-08-28)


### ✨ Features

* add contracts-ts package ([780a60f](https://github.com/cowprotocol/cow-sdk/commit/780a60f58bc67b27f161b0abab1f8ef81b2ea64b))
* add contracts-ts package ([af47c0c](https://github.com/cowprotocol/cow-sdk/commit/af47c0cbe1ff93378decdcd4813645a5aeb67288))
* add tests for contracts-ts ([4f39d4d](https://github.com/cowprotocol/cow-sdk/commit/4f39d4d37bf2f67a2686ac6709795c01f4a43ad0))
* add tests for contracts-ts ([9d6a4b8](https://github.com/cowprotocol/cow-sdk/commit/9d6a4b8d3eeaf7a62312f3d1747df3528fd7fbe4))
* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **cow-shed:** refact on common and contract-ts ([4be05aa](https://github.com/cowprotocol/cow-sdk/commit/4be05aa7a376fbc7d2ed5b2d2b6b68e3630b9c59))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* refactor contracts-ts ([2e14272](https://github.com/cowprotocol/cow-sdk/commit/2e14272f1a24a232aef584611924055ed657d16c))
* refactor contracts-ts ([b441360](https://github.com/cowprotocol/cow-sdk/commit/b4413600d4a0753e9f608e6a6415e64762a53d3e))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* simplify OrderSigningUtils to use static methods only ([#417](https://github.com/cowprotocol/cow-sdk/issues/417)) ([899ca43](https://github.com/cowprotocol/cow-sdk/commit/899ca4325be831b6711468d1df3733d98fe913b0))


### 🐛 Bug Fixes

* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))


### 🔧 Miscellaneous

* apply PR suggestions ([2ff0f7c](https://github.com/cowprotocol/cow-sdk/commit/2ff0f7c74c377b67824da3ba6390edccdaad94f5))
* fix merge ([5c511de](https://github.com/cowprotocol/cow-sdk/commit/5c511deedd0c7821df6affefc9623c79a68c96c7))
* **lint:** lint ([881e345](https://github.com/cowprotocol/cow-sdk/commit/881e3451add9d911047daebe4e36fe777d95927a))
* merge main 28-06-2025 ([#452](https://github.com/cowprotocol/cow-sdk/issues/452)) ([4c198ce](https://github.com/cowprotocol/cow-sdk/commit/4c198ce34890740bf0a0fe859620a9e1ad432bed))
* remove console logs ([ce11a98](https://github.com/cowprotocol/cow-sdk/commit/ce11a98a36e609e963d51b8ffce1cb1995fe090f))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
* update contracts-ts config ([68360fc](https://github.com/cowprotocol/cow-sdk/commit/68360fc030cd269d13d5aee8f2e89b53c4b4fc74))
