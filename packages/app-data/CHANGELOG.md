# Changelog

## [5.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.5...sdk-app-data-v5.0.0) (2025-10-29)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **app-data:** update flashloan schema to 0.2.0 ([#572](https://github.com/cowprotocol/cow-sdk/issues/572)) ([e909dbd](https://github.com/cowprotocol/cow-sdk/commit/e909dbd059077fa80c52c9651b4ae2b6f6edd97c))
* copy entire src, tests folders, and package/tsconfig files from app-data project into the monorepo ([70ef622](https://github.com/cowprotocol/cow-sdk/commit/70ef622eac14cb38837144ab15418eff27d8cba7))
* implement adapter usage in app-data; update app-data config and test files ([422afd2](https://github.com/cowprotocol/cow-sdk/commit/422afd2e7613d6f7558764f149b15aae4be65390))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create app data package ([#327](https://github.com/cowprotocol/cow-sdk/issues/327)) ([8b61261](https://github.com/cowprotocol/cow-sdk/commit/8b612615bc280dee2e5f4767794bc03f590d4764))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### 🐛 Bug Fixes

* **app-data:** fix typos and ids in schemas ([#586](https://github.com/cowprotocol/cow-sdk/issues/586)) ([5a4461a](https://github.com/cowprotocol/cow-sdk/commit/5a4461a2a171689db04f7c805c9e2c835bbd36dd))
* **app-data:** remove dappId validation ([#591](https://github.com/cowprotocol/cow-sdk/issues/591)) ([9db80c3](https://github.com/cowprotocol/cow-sdk/commit/9db80c34923c6b12ed9ecb3ed26ca1a99acd2b8f))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### 🔧 Miscellaneous

* fix lint and remove cow-sdk from lint. ([46decb7](https://github.com/cowprotocol/cow-sdk/commit/46decb72050c1b9481b24d9b10b6a4c4f2abe0c3))
* fix merge ([5c511de](https://github.com/cowprotocol/cow-sdk/commit/5c511deedd0c7821df6affefc9623c79a68c96c7))
* lint files ([8f1d0a5](https://github.com/cowprotocol/cow-sdk/commit/8f1d0a555141e995e475e58e4b3abc087ec2a9f3))
* **lint:** lint ([881e345](https://github.com/cowprotocol/cow-sdk/commit/881e3451add9d911047daebe4e36fe777d95927a))
* merge main 28-06-2025 ([#452](https://github.com/cowprotocol/cow-sdk/issues/452)) ([4c198ce](https://github.com/cowprotocol/cow-sdk/commit/4c198ce34890740bf0a0fe859620a9e1ad432bed))
* move constants to sdk-common ([c1336c3](https://github.com/cowprotocol/cow-sdk/commit/c1336c3af5dc51c649c9435919e5e1054a6f94d5))
* release main ([#453](https://github.com/cowprotocol/cow-sdk/issues/453)) ([36080c1](https://github.com/cowprotocol/cow-sdk/commit/36080c1955f5f161bebce7867af110f6938e5c95))
* release main ([#486](https://github.com/cowprotocol/cow-sdk/issues/486)) ([cf53df2](https://github.com/cowprotocol/cow-sdk/commit/cf53df2d0f5e96a544165547958ecc959c1948d7))
* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))
* release main ([#491](https://github.com/cowprotocol/cow-sdk/issues/491)) ([bf28181](https://github.com/cowprotocol/cow-sdk/commit/bf281814844e0f9b5ad1cd1f5b12f89e6bea3a5a))
* release main ([#500](https://github.com/cowprotocol/cow-sdk/issues/500)) ([76c5185](https://github.com/cowprotocol/cow-sdk/commit/76c5185d4b827d185af11bef9435fbed87484b0b))
* release main ([#502](https://github.com/cowprotocol/cow-sdk/issues/502)) ([c452d8e](https://github.com/cowprotocol/cow-sdk/commit/c452d8e53bc0dcd79052b1877d2c48a32777093e))
* release main ([#503](https://github.com/cowprotocol/cow-sdk/issues/503)) ([532d8eb](https://github.com/cowprotocol/cow-sdk/commit/532d8eb2a0a0f9ec5775e566fe2507f1ccc4f961))
* release main ([#505](https://github.com/cowprotocol/cow-sdk/issues/505)) ([0f98564](https://github.com/cowprotocol/cow-sdk/commit/0f985640c6e6f0852505cb3ad66c07bd3f23ea7b))
* release main ([#511](https://github.com/cowprotocol/cow-sdk/issues/511)) ([5629bb2](https://github.com/cowprotocol/cow-sdk/commit/5629bb25f89b62e490b9819393036994688bf648))
* release main ([#515](https://github.com/cowprotocol/cow-sdk/issues/515)) ([912e315](https://github.com/cowprotocol/cow-sdk/commit/912e31551440ebfa61d7d2f5c846d61162559448))
* release main ([#542](https://github.com/cowprotocol/cow-sdk/issues/542)) ([e9f98a6](https://github.com/cowprotocol/cow-sdk/commit/e9f98a623cf81f4a9246550999914c88eb1fca30))
* release main ([#573](https://github.com/cowprotocol/cow-sdk/issues/573)) ([cd5d917](https://github.com/cowprotocol/cow-sdk/commit/cd5d9170fad149f743c0f9bb991101de3b7d4e61))
* release main ([#575](https://github.com/cowprotocol/cow-sdk/issues/575)) ([2ef068b](https://github.com/cowprotocol/cow-sdk/commit/2ef068b851e5d114784f81ecbcd0fe3c512b7570))
* release main ([#581](https://github.com/cowprotocol/cow-sdk/issues/581)) ([0f09262](https://github.com/cowprotocol/cow-sdk/commit/0f0926297da8949de97379e7300a1e5301bde724))
* release main ([#592](https://github.com/cowprotocol/cow-sdk/issues/592)) ([e4d7212](https://github.com/cowprotocol/cow-sdk/commit/e4d7212af322beced743e985bd1fbedaef66cdcb))
* release main ([#596](https://github.com/cowprotocol/cow-sdk/issues/596)) ([9d8bfc9](https://github.com/cowprotocol/cow-sdk/commit/9d8bfc9ab1009b19ed08e1611b0ff310e116b1f8))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0

## [4.1.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.4...sdk-app-data-v4.1.5) (2025-10-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.0

## [4.1.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.3...sdk-app-data-v4.1.4) (2025-10-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.2
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.2.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.3

## [4.1.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.2...sdk-app-data-v4.1.3) (2025-10-17)


### 🐛 Bug Fixes

* **app-data:** remove dappId validation ([#591](https://github.com/cowprotocol/cow-sdk/issues/591)) ([9db80c3](https://github.com/cowprotocol/cow-sdk/commit/9db80c34923c6b12ed9ecb3ed26ca1a99acd2b8f))


### 🔧 Miscellaneous

* release main ([#592](https://github.com/cowprotocol/cow-sdk/issues/592)) ([e4d7212](https://github.com/cowprotocol/cow-sdk/commit/e4d7212af322beced743e985bd1fbedaef66cdcb))

## [4.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.1...sdk-app-data-v4.1.2) (2025-10-15)


### 🐛 Bug Fixes

* **app-data:** fix typos and ids in schemas ([#586](https://github.com/cowprotocol/cow-sdk/issues/586)) ([5a4461a](https://github.com/cowprotocol/cow-sdk/commit/5a4461a2a171689db04f7c805c9e2c835bbd36dd))

## [4.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.0...sdk-app-data-v4.1.1) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.2

## [4.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.0.1...sdk-app-data-v4.1.0) (2025-10-08)


### ✨ Features

* **app-data:** update flashloan schema to 0.2.0 ([#572](https://github.com/cowprotocol/cow-sdk/issues/572)) ([e909dbd](https://github.com/cowprotocol/cow-sdk/commit/e909dbd059077fa80c52c9651b4ae2b6f6edd97c))

## [4.0.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.0.0...sdk-app-data-v4.0.1) (2025-10-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.1

## [4.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.7-beta.0...sdk-app-data-v4.0.0) (2025-09-17)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.1.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.1.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.0

## [4.1.7-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.6-beta.0...sdk-app-data-v4.1.7-beta.0) (2025-09-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.0-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.1-beta.0

## [4.1.6-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.5-beta.0...sdk-app-data-v4.1.6-beta.0) (2025-09-16)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.4-beta.0

## [4.1.5-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.4-beta.0...sdk-app-data-v4.1.5-beta.0) (2025-09-16)


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.4.0-beta.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.3.3-beta.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0-beta.0

## [4.1.4-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.3-beta.0...sdk-app-data-v4.1.4-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.3.2-beta.0

## [4.1.3-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.2-beta.0...sdk-app-data-v4.1.3-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.3.1-beta.0

## [4.1.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.1-beta.0...sdk-app-data-v4.1.2-beta.0) (2025-09-11)


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

## [4.1.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.0-beta.0...sdk-app-data-v4.1.1-beta.0) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.3.0-beta.0

## [4.1.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.0.0-beta.0...sdk-app-data-v4.1.0-beta.0) (2025-08-28)


### ✨ Features

* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* copy entire src, tests folders, and package/tsconfig files from app-data project into the monorepo ([70ef622](https://github.com/cowprotocol/cow-sdk/commit/70ef622eac14cb38837144ab15418eff27d8cba7))
* implement adapter usage in app-data; update app-data config and test files ([422afd2](https://github.com/cowprotocol/cow-sdk/commit/422afd2e7613d6f7558764f149b15aae4be65390))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* **sdk-agnostic-lib:** create app data package ([#327](https://github.com/cowprotocol/cow-sdk/issues/327)) ([8b61261](https://github.com/cowprotocol/cow-sdk/commit/8b612615bc280dee2e5f4767794bc03f590d4764))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### 🐛 Bug Fixes

* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))


### 🔧 Miscellaneous

* fix lint and remove cow-sdk from lint. ([46decb7](https://github.com/cowprotocol/cow-sdk/commit/46decb72050c1b9481b24d9b10b6a4c4f2abe0c3))
* fix merge ([5c511de](https://github.com/cowprotocol/cow-sdk/commit/5c511deedd0c7821df6affefc9623c79a68c96c7))
* lint files ([8f1d0a5](https://github.com/cowprotocol/cow-sdk/commit/8f1d0a555141e995e475e58e4b3abc087ec2a9f3))
* **lint:** lint ([881e345](https://github.com/cowprotocol/cow-sdk/commit/881e3451add9d911047daebe4e36fe777d95927a))
* merge main 28-06-2025 ([#452](https://github.com/cowprotocol/cow-sdk/issues/452)) ([4c198ce](https://github.com/cowprotocol/cow-sdk/commit/4c198ce34890740bf0a0fe859620a9e1ad432bed))
* move constants to sdk-common ([c1336c3](https://github.com/cowprotocol/cow-sdk/commit/c1336c3af5dc51c649c9435919e5e1054a6f94d5))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
