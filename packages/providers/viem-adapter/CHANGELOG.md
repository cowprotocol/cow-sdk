# Changelog

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.2.0...sdk-viem-adapter-v1.0.0) (2025-10-29)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* add from/to fields for receipt ([#629](https://github.com/cowprotocol/cow-sdk/issues/629)) ([3dd3868](https://github.com/cowprotocol/cow-sdk/commit/3dd38682741ac93bfbd9b7d9a4fe79df7283dca0))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* add new order-signing features to adapters ([555d55f](https://github.com/cowprotocol/cow-sdk/commit/555d55ff353376c11deef498b76795d5e7dcabca))
* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **cow-shed:** add estimateGas method to SignerAdapters ([fbb626a](https://github.com/cowprotocol/cow-sdk/commit/fbb626a0f88f6cb206432b4233b2d7d1e7cd4ad4))
* **cow-shed:** refact on common and contract-ts ([4be05aa](https://github.com/cowprotocol/cow-sdk/commit/4be05aa7a376fbc7d2ed5b2d2b6b68e3630b9c59))
* enhance adapters and utils with composable features ([8691d42](https://github.com/cowprotocol/cow-sdk/commit/8691d42b8076c7d240a97e6808902f6d8742bcd3))
* enhance composable to test the 3 adapters ([7d1bd77](https://github.com/cowprotocol/cow-sdk/commit/7d1bd776b40a10808b9f6392dda862f610131169))
* implement adapters for ethers v5, ethers v6, and viem ([1231f7c](https://github.com/cowprotocol/cow-sdk/commit/1231f7c1809fd497d15e8945b880a9c3da6fa6b4))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** Add composable package ([bf3f864](https://github.com/cowprotocol/cow-sdk/commit/bf3f864815326813bbb18d2d98d10345d9aa6a2b))
* **sdk-agnostic-lib:** create app data package ([#327](https://github.com/cowprotocol/cow-sdk/issues/327)) ([8b61261](https://github.com/cowprotocol/cow-sdk/commit/8b612615bc280dee2e5f4767794bc03f590d4764))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* update adapters with new contracts-ts features ([aadd9a7](https://github.com/cowprotocol/cow-sdk/commit/aadd9a74771876c21339bfb4731654656a325d96))
* update adapters with new contracts-ts features ([fc94704](https://github.com/cowprotocol/cow-sdk/commit/fc947043316a603e64f3c3d4b07178169d21a9a6))


### 🐛 Bug Fixes

* **cow-shed:** fix adapters - estimateGas  and encodeAbi ([76ab995](https://github.com/cowprotocol/cow-sdk/commit/76ab995635247e63213dafb50ff462334977cc6d))
* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))
* viemUtils encodeAbi ([c5698dd](https://github.com/cowprotocol/cow-sdk/commit/c5698ddc14bbcd68e88440b50c40f4c927beccb7))


### 🔧 Miscellaneous

* release main ([#453](https://github.com/cowprotocol/cow-sdk/issues/453)) ([36080c1](https://github.com/cowprotocol/cow-sdk/commit/36080c1955f5f161bebce7867af110f6938e5c95))
* release main ([#467](https://github.com/cowprotocol/cow-sdk/issues/467)) ([ed2977a](https://github.com/cowprotocol/cow-sdk/commit/ed2977a82bb2f4b43de900840848e33532d001f0))
* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))
* release main ([#491](https://github.com/cowprotocol/cow-sdk/issues/491)) ([bf28181](https://github.com/cowprotocol/cow-sdk/commit/bf281814844e0f9b5ad1cd1f5b12f89e6bea3a5a))
* release main ([#503](https://github.com/cowprotocol/cow-sdk/issues/503)) ([532d8eb](https://github.com/cowprotocol/cow-sdk/commit/532d8eb2a0a0f9ec5775e566fe2507f1ccc4f961))
* release main ([#511](https://github.com/cowprotocol/cow-sdk/issues/511)) ([5629bb2](https://github.com/cowprotocol/cow-sdk/commit/5629bb25f89b62e490b9819393036994688bf648))
* release main ([#515](https://github.com/cowprotocol/cow-sdk/issues/515)) ([912e315](https://github.com/cowprotocol/cow-sdk/commit/912e31551440ebfa61d7d2f5c846d61162559448))
* release main ([#542](https://github.com/cowprotocol/cow-sdk/issues/542)) ([e9f98a6](https://github.com/cowprotocol/cow-sdk/commit/e9f98a623cf81f4a9246550999914c88eb1fca30))
* release main ([#575](https://github.com/cowprotocol/cow-sdk/issues/575)) ([2ef068b](https://github.com/cowprotocol/cow-sdk/commit/2ef068b851e5d114784f81ecbcd0fe3c512b7570))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0

## [0.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.1.3...sdk-viem-adapter-v0.2.0) (2025-10-29)


### ✨ Features

* add from/to fields for receipt ([#629](https://github.com/cowprotocol/cow-sdk/issues/629)) ([3dd3868](https://github.com/cowprotocol/cow-sdk/commit/3dd38682741ac93bfbd9b7d9a4fe79df7283dca0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0

## [0.1.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.1.2...sdk-viem-adapter-v0.1.3) (2025-10-24)


### 🐛 Bug Fixes

* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.2

## [0.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.1.1...sdk-viem-adapter-v0.1.2) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.1

## [0.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.1.0...sdk-viem-adapter-v0.1.1) (2025-10-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.0

## [0.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.3.1-beta.0...sdk-viem-adapter-v0.1.0) (2025-09-17)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.1.0

## [0.3.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.3.0-beta.0...sdk-viem-adapter-v0.3.1-beta.0) (2025-09-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.0-beta.0

## [0.3.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.2.2-beta.0...sdk-viem-adapter-v0.3.0-beta.0) (2025-09-16)


### ✨ Features

* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.4.0-beta.0

## [0.2.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.2.1-beta.0...sdk-viem-adapter-v0.2.2-beta.0) (2025-09-11)


### 🔧 Miscellaneous

* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0-beta.0

## [0.2.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.2.0-beta.0...sdk-viem-adapter-v0.2.1-beta.0) (2025-09-01)


### 🐛 Bug Fixes

* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))

## [0.2.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.1.0-beta.0...sdk-viem-adapter-v0.2.0-beta.0) (2025-08-28)


### ✨ Features

* add new order-signing features to adapters ([555d55f](https://github.com/cowprotocol/cow-sdk/commit/555d55ff353376c11deef498b76795d5e7dcabca))
* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **cow-shed:** add estimateGas method to SignerAdapters ([fbb626a](https://github.com/cowprotocol/cow-sdk/commit/fbb626a0f88f6cb206432b4233b2d7d1e7cd4ad4))
* **cow-shed:** refact on common and contract-ts ([4be05aa](https://github.com/cowprotocol/cow-sdk/commit/4be05aa7a376fbc7d2ed5b2d2b6b68e3630b9c59))
* enhance adapters and utils with composable features ([8691d42](https://github.com/cowprotocol/cow-sdk/commit/8691d42b8076c7d240a97e6808902f6d8742bcd3))
* enhance composable to test the 3 adapters ([7d1bd77](https://github.com/cowprotocol/cow-sdk/commit/7d1bd776b40a10808b9f6392dda862f610131169))
* implement adapters for ethers v5, ethers v6, and viem ([1231f7c](https://github.com/cowprotocol/cow-sdk/commit/1231f7c1809fd497d15e8945b880a9c3da6fa6b4))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **sdk-agnostic-lib:** create app data package ([#327](https://github.com/cowprotocol/cow-sdk/issues/327)) ([8b61261](https://github.com/cowprotocol/cow-sdk/commit/8b612615bc280dee2e5f4767794bc03f590d4764))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* update adapters with new contracts-ts features ([aadd9a7](https://github.com/cowprotocol/cow-sdk/commit/aadd9a74771876c21339bfb4731654656a325d96))
* update adapters with new contracts-ts features ([fc94704](https://github.com/cowprotocol/cow-sdk/commit/fc947043316a603e64f3c3d4b07178169d21a9a6))


### 🐛 Bug Fixes

* **cow-shed:** fix adapters - estimateGas  and encodeAbi ([76ab995](https://github.com/cowprotocol/cow-sdk/commit/76ab995635247e63213dafb50ff462334977cc6d))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* viemUtils encodeAbi ([c5698dd](https://github.com/cowprotocol/cow-sdk/commit/c5698ddc14bbcd68e88440b50c40f4c927beccb7))


### 🔧 Miscellaneous

* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
