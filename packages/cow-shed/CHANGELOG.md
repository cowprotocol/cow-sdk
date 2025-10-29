# Changelog

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.8...sdk-cow-shed-v1.0.0) (2025-10-29)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **cow-shed:** create package.json and tsconfig.json ([2548f17](https://github.com/cowprotocol/cow-sdk/commit/2548f17f75319d9615a814fdae5d13c25b9220ee))
* **cow-shed:** refact cow-she to use adapters and fix tests ([25b0986](https://github.com/cowprotocol/cow-sdk/commit/25b098630ae7850e6d09dcdfc9dcd67266cd7df1))
* **cow-shed:** validate EIP1271 signature ([#508](https://github.com/cowprotocol/cow-sdk/issues/508)) ([5c72123](https://github.com/cowprotocol/cow-sdk/commit/5c7212323edcea3eadf70973f765619afb1bcaf4))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### 🐛 Bug Fixes

* **cow-shed:** fix adapters - estimateGas  and encodeAbi ([76ab995](https://github.com/cowprotocol/cow-sdk/commit/76ab995635247e63213dafb50ff462334977cc6d))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### 🔧 Miscellaneous

* add check to verify if the signature is the same across all three adapters in cowshedHooks test ([5558b86](https://github.com/cowprotocol/cow-sdk/commit/5558b867075ab9f0eb75eedf349d9ef96d65055f))
* adjust cow-shed hooks test ([812d18c](https://github.com/cowprotocol/cow-sdk/commit/812d18c7b1cac64668d3643212f34b99efb08ebd))
* apply PR suggestions ([2ff0f7c](https://github.com/cowprotocol/cow-sdk/commit/2ff0f7c74c377b67824da3ba6390edccdaad94f5))
* **cow-shed:** rename CowShedHooks test file ([4bf22a6](https://github.com/cowprotocol/cow-sdk/commit/4bf22a622413446874592c23178648c71fe66368))
* release main ([#453](https://github.com/cowprotocol/cow-sdk/issues/453)) ([36080c1](https://github.com/cowprotocol/cow-sdk/commit/36080c1955f5f161bebce7867af110f6938e5c95))
* release main ([#486](https://github.com/cowprotocol/cow-sdk/issues/486)) ([cf53df2](https://github.com/cowprotocol/cow-sdk/commit/cf53df2d0f5e96a544165547958ecc959c1948d7))
* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))
* release main ([#491](https://github.com/cowprotocol/cow-sdk/issues/491)) ([bf28181](https://github.com/cowprotocol/cow-sdk/commit/bf281814844e0f9b5ad1cd1f5b12f89e6bea3a5a))
* release main ([#497](https://github.com/cowprotocol/cow-sdk/issues/497)) ([7d97945](https://github.com/cowprotocol/cow-sdk/commit/7d979459a2febdee59f98570fbd2271c4c61d0df))
* release main ([#500](https://github.com/cowprotocol/cow-sdk/issues/500)) ([76c5185](https://github.com/cowprotocol/cow-sdk/commit/76c5185d4b827d185af11bef9435fbed87484b0b))
* release main ([#502](https://github.com/cowprotocol/cow-sdk/issues/502)) ([c452d8e](https://github.com/cowprotocol/cow-sdk/commit/c452d8e53bc0dcd79052b1877d2c48a32777093e))
* release main ([#503](https://github.com/cowprotocol/cow-sdk/issues/503)) ([532d8eb](https://github.com/cowprotocol/cow-sdk/commit/532d8eb2a0a0f9ec5775e566fe2507f1ccc4f961))
* release main ([#505](https://github.com/cowprotocol/cow-sdk/issues/505)) ([0f98564](https://github.com/cowprotocol/cow-sdk/commit/0f985640c6e6f0852505cb3ad66c07bd3f23ea7b))
* release main ([#511](https://github.com/cowprotocol/cow-sdk/issues/511)) ([5629bb2](https://github.com/cowprotocol/cow-sdk/commit/5629bb25f89b62e490b9819393036994688bf648))
* release main ([#515](https://github.com/cowprotocol/cow-sdk/issues/515)) ([912e315](https://github.com/cowprotocol/cow-sdk/commit/912e31551440ebfa61d7d2f5c846d61162559448))
* release main ([#524](https://github.com/cowprotocol/cow-sdk/issues/524)) ([78c209b](https://github.com/cowprotocol/cow-sdk/commit/78c209bc5feeb90007bd9043dc5be861fed2d0ac))
* release main ([#532](https://github.com/cowprotocol/cow-sdk/issues/532)) ([762ebd8](https://github.com/cowprotocol/cow-sdk/commit/762ebd8a17fbec8a452e62c52e8efb5cd9d3070b))
* release main ([#534](https://github.com/cowprotocol/cow-sdk/issues/534)) ([cb65e65](https://github.com/cowprotocol/cow-sdk/commit/cb65e653925d0ef1942428738e74046b61c0020a))
* release main ([#542](https://github.com/cowprotocol/cow-sdk/issues/542)) ([e9f98a6](https://github.com/cowprotocol/cow-sdk/commit/e9f98a623cf81f4a9246550999914c88eb1fca30))
* release main ([#575](https://github.com/cowprotocol/cow-sdk/issues/575)) ([2ef068b](https://github.com/cowprotocol/cow-sdk/commit/2ef068b851e5d114784f81ecbcd0fe3c512b7570))
* release main ([#581](https://github.com/cowprotocol/cow-sdk/issues/581)) ([0f09262](https://github.com/cowprotocol/cow-sdk/commit/0f0926297da8949de97379e7300a1e5301bde724))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
* **subgraph:** move cow-shed to monorepo package ([2e7b27a](https://github.com/cowprotocol/cow-sdk/commit/2e7b27ae5ec04d03dc919cf508b1c4eb723818aa))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0

## [0.1.8](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.7...sdk-cow-shed-v0.1.8) (2025-10-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.2
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.0

## [0.1.7](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.6...sdk-cow-shed-v0.1.7) (2025-10-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.2.0
    * @cowprotocol/sdk-common bumped to 0.2.2
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.3

## [0.1.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.5...sdk-cow-shed-v0.1.6) (2025-10-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.0

## [0.1.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.4...sdk-cow-shed-v0.1.5) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.1
    * @cowprotocol/sdk-contracts-ts bumped to 0.3.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.2

## [0.1.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.3...sdk-cow-shed-v0.1.4) (2025-10-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.3.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.1

## [0.1.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.2...sdk-cow-shed-v0.1.3) (2025-09-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.2.1

## [0.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.1...sdk-cow-shed-v0.1.2) (2025-09-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.2.0

## [0.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.0...sdk-cow-shed-v0.1.1) (2025-09-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.1.1

## [0.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.3.0-beta.0...sdk-cow-shed-v0.1.0) (2025-09-17)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.1.0
    * @cowprotocol/sdk-common bumped to 0.1.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.1.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.0

## [0.3.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.2.7-beta.0...sdk-cow-shed-v0.3.0-beta.0) (2025-09-17)


### ✨ Features

* **cow-shed:** validate EIP1271 signature ([#508](https://github.com/cowprotocol/cow-sdk/issues/508)) ([5c72123](https://github.com/cowprotocol/cow-sdk/commit/5c7212323edcea3eadf70973f765619afb1bcaf4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.0-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.3.0-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.1-beta.0

## [0.2.7-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.2.6-beta.0...sdk-cow-shed-v0.2.7-beta.0) (2025-09-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 2.2.1-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.4-beta.0

## [0.2.6-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.2.5-beta.0...sdk-cow-shed-v0.2.6-beta.0) (2025-09-16)


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.3-beta.0
    * @cowprotocol/sdk-common bumped to 0.4.0-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.2.0-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0-beta.0

## [0.2.5-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.2.4-beta.0...sdk-cow-shed-v0.2.5-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.2-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.7-beta.0

## [0.2.4-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.2.3-beta.0...sdk-cow-shed-v0.2.4-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.1-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.6-beta.0

## [0.2.3-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.2.2-beta.0...sdk-cow-shed-v0.2.3-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.5-beta.0

## [0.2.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.2.1-beta.0...sdk-cow-shed-v0.2.2-beta.0) (2025-09-11)


### 🔧 Miscellaneous

* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.4-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.2-beta.0

## [0.2.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.2.0-beta.0...sdk-cow-shed-v0.2.1-beta.0) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.3-beta.0

## [0.2.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.1.0-beta.0...sdk-cow-shed-v0.2.0-beta.0) (2025-08-28)


### ✨ Features

* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **cow-shed:** create package.json and tsconfig.json ([2548f17](https://github.com/cowprotocol/cow-sdk/commit/2548f17f75319d9615a814fdae5d13c25b9220ee))
* **cow-shed:** refact cow-she to use adapters and fix tests ([25b0986](https://github.com/cowprotocol/cow-sdk/commit/25b098630ae7850e6d09dcdfc9dcd67266cd7df1))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### 🐛 Bug Fixes

* **cow-shed:** fix adapters - estimateGas  and encodeAbi ([76ab995](https://github.com/cowprotocol/cow-sdk/commit/76ab995635247e63213dafb50ff462334977cc6d))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))


### 🔧 Miscellaneous

* add check to verify if the signature is the same across all three adapters in cowshedHooks test ([5558b86](https://github.com/cowprotocol/cow-sdk/commit/5558b867075ab9f0eb75eedf349d9ef96d65055f))
* adjust cow-shed hooks test ([812d18c](https://github.com/cowprotocol/cow-sdk/commit/812d18c7b1cac64668d3643212f34b99efb08ebd))
* apply PR suggestions ([2ff0f7c](https://github.com/cowprotocol/cow-sdk/commit/2ff0f7c74c377b67824da3ba6390edccdaad94f5))
* **cow-shed:** rename CowShedHooks test file ([4bf22a6](https://github.com/cowprotocol/cow-sdk/commit/4bf22a622413446874592c23178648c71fe66368))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
* **subgraph:** move cow-shed to monorepo package ([2e7b27a](https://github.com/cowprotocol/cow-sdk/commit/2e7b27ae5ec04d03dc919cf508b1c4eb723818aa))
