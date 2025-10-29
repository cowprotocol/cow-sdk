# Changelog

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.5.1...sdk-bridging-v1.0.0) (2025-10-29)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* add caching to SDK Bridging ([#521](https://github.com/cowprotocol/cow-sdk/issues/521)) ([0c44212](https://github.com/cowprotocol/cow-sdk/commit/0c442121af74c297a002c7c0f608fb3396b9a446))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* allow Bungee API custom base url and api key ([#517](https://github.com/cowprotocol/cow-sdk/issues/517)) ([a5cda81](https://github.com/cowprotocol/cow-sdk/commit/a5cda813d9f58a9e16393ab4eb1e350296fef2f8))
* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* allow other bridge provider families in CoW Swap: Recipient based ([#552](https://github.com/cowprotocol/cow-sdk/issues/552)) ([ae56511](https://github.com/cowprotocol/cow-sdk/commit/ae565112dd1fe107d7b297eddf529e07f06529fb))
* autopublish to npm registry in GH ([#539](https://github.com/cowprotocol/cow-sdk/issues/539)) ([9e4a755](https://github.com/cowprotocol/cow-sdk/commit/9e4a7551b5e0a32a7a9e4ca3781ec088e16e25af))
* **bridge:** add Bungee affiliate field ([aa32cc9](https://github.com/cowprotocol/cow-sdk/commit/aa32cc9bfdd8c0b3dd6d15e8485f2c089feec11b))
* **bridge:** add method to get best result from multiple providers ([#527](https://github.com/cowprotocol/cow-sdk/issues/527)) ([afd0005](https://github.com/cowprotocol/cow-sdk/commit/afd00053df4cbc4fdf9dcaa57ff0285d4e2af643))
* **bridge:** decompose BridgingSdk logic into strategies ([#528](https://github.com/cowprotocol/cow-sdk/issues/528)) ([be1a0f3](https://github.com/cowprotocol/cow-sdk/commit/be1a0f3d4995e6ac3ae929dd2b1aab3a6cbfd6c5))
* **bridge:** fallback to public endpoints in BungeeApi ([#529](https://github.com/cowprotocol/cow-sdk/issues/529)) ([b857aa7](https://github.com/cowprotocol/cow-sdk/commit/b857aa7cb8ee7a323e59922684549bdb734e374c))
* **bridge:** make multi-quote method progressive ([#526](https://github.com/cowprotocol/cow-sdk/issues/526)) ([27536c6](https://github.com/cowprotocol/cow-sdk/commit/27536c63ec91a26323ffb341c1edbef0ab9331a3))
* **bridge:** support multi provider quote requests ([#518](https://github.com/cowprotocol/cow-sdk/issues/518)) ([36ed8f9](https://github.com/cowprotocol/cow-sdk/commit/36ed8f999d0b532b1a6e9c50c3152e3242dd333e))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### 🐛 Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* **bridge:** fix Across tx explorer link ([#537](https://github.com/cowprotocol/cow-sdk/issues/537)) ([d76db02](https://github.com/cowprotocol/cow-sdk/commit/d76db02a53cebe6a18032293729d590affa0c38c))
* **bridge:** fix applying affiliate header ([#492](https://github.com/cowprotocol/cow-sdk/issues/492)) ([e4f49c6](https://github.com/cowprotocol/cow-sdk/commit/e4f49c64e60f4aeac97b6b246c36090946df6fcf))
* **bridge:** increase gas for Gnosis bridge hook ([71b987d](https://github.com/cowprotocol/cow-sdk/commit/71b987d3a53d59aa0dad1fbdaaab36b0c77c72a7))
* **bridge:** multi-quote strategies should not swallow BridgeProviderQuoteError ([#533](https://github.com/cowprotocol/cow-sdk/issues/533)) ([7789699](https://github.com/cowprotocol/cow-sdk/commit/77896999aa2140b70cd2919ede279eb7ebcf0b7b))
* **bridge:** relax multi-quote errors wrapping ([#535](https://github.com/cowprotocol/cow-sdk/issues/535)) ([551f3d8](https://github.com/cowprotocol/cow-sdk/commit/551f3d899b125838101b7ba4214b37c2ceaf36ea))
* **bridge:** update bungee smart-contract address ([#506](https://github.com/cowprotocol/cow-sdk/issues/506)) ([f8e736a](https://github.com/cowprotocol/cow-sdk/commit/f8e736aafb6c3ca2c2020282e0f1af7ce6c0b5ac))
* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### 🧪 Tests

* fix MultiQuoteStrategy flacky tests ([#540](https://github.com/cowprotocol/cow-sdk/issues/540)) ([aa0f90c](https://github.com/cowprotocol/cow-sdk/commit/aa0f90c04b2eaf6da08698e487dcdc62cb7ad8c1))


### 🔧 Miscellaneous

* add TODO to Across getDepositParams ([#560](https://github.com/cowprotocol/cow-sdk/issues/560)) ([16ebe8e](https://github.com/cowprotocol/cow-sdk/commit/16ebe8ea0b297bba949571102c1d0602a403f5ee))
* fix flaky test ([#547](https://github.com/cowprotocol/cow-sdk/issues/547)) ([4fb1861](https://github.com/cowprotocol/cow-sdk/commit/4fb18618c9d60387845cbb5741abafbbeed81991))
* fix main merge ([c1aa2b8](https://github.com/cowprotocol/cow-sdk/commit/c1aa2b81bd4e1b008b87a4207c8cf3358056ab1b))
* fix merge ([5c511de](https://github.com/cowprotocol/cow-sdk/commit/5c511deedd0c7821df6affefc9623c79a68c96c7))
* make doc links absolute ([f03aabb](https://github.com/cowprotocol/cow-sdk/commit/f03aabb745e0cf51e3c9d5d8464f733e2668d544))
* merge main 28-06-2025 ([#452](https://github.com/cowprotocol/cow-sdk/issues/452)) ([4c198ce](https://github.com/cowprotocol/cow-sdk/commit/4c198ce34890740bf0a0fe859620a9e1ad432bed))
* migrate latest changes from main 26-08-2025 ([#445](https://github.com/cowprotocol/cow-sdk/issues/445)) ([698937c](https://github.com/cowprotocol/cow-sdk/commit/698937c0feff3a254873371bc1ef791917e6294e))
* release main ([#453](https://github.com/cowprotocol/cow-sdk/issues/453)) ([36080c1](https://github.com/cowprotocol/cow-sdk/commit/36080c1955f5f161bebce7867af110f6938e5c95))
* release main ([#467](https://github.com/cowprotocol/cow-sdk/issues/467)) ([ed2977a](https://github.com/cowprotocol/cow-sdk/commit/ed2977a82bb2f4b43de900840848e33532d001f0))
* release main ([#486](https://github.com/cowprotocol/cow-sdk/issues/486)) ([cf53df2](https://github.com/cowprotocol/cow-sdk/commit/cf53df2d0f5e96a544165547958ecc959c1948d7))
* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))
* release main ([#491](https://github.com/cowprotocol/cow-sdk/issues/491)) ([bf28181](https://github.com/cowprotocol/cow-sdk/commit/bf281814844e0f9b5ad1cd1f5b12f89e6bea3a5a))
* release main ([#497](https://github.com/cowprotocol/cow-sdk/issues/497)) ([7d97945](https://github.com/cowprotocol/cow-sdk/commit/7d979459a2febdee59f98570fbd2271c4c61d0df))
* release main ([#500](https://github.com/cowprotocol/cow-sdk/issues/500)) ([76c5185](https://github.com/cowprotocol/cow-sdk/commit/76c5185d4b827d185af11bef9435fbed87484b0b))
* release main ([#502](https://github.com/cowprotocol/cow-sdk/issues/502)) ([c452d8e](https://github.com/cowprotocol/cow-sdk/commit/c452d8e53bc0dcd79052b1877d2c48a32777093e))
* release main ([#503](https://github.com/cowprotocol/cow-sdk/issues/503)) ([532d8eb](https://github.com/cowprotocol/cow-sdk/commit/532d8eb2a0a0f9ec5775e566fe2507f1ccc4f961))
* release main ([#505](https://github.com/cowprotocol/cow-sdk/issues/505)) ([0f98564](https://github.com/cowprotocol/cow-sdk/commit/0f985640c6e6f0852505cb3ad66c07bd3f23ea7b))
* release main ([#507](https://github.com/cowprotocol/cow-sdk/issues/507)) ([9d61447](https://github.com/cowprotocol/cow-sdk/commit/9d61447f949042e193e62d8edbe5dc28478b27ff))
* release main ([#511](https://github.com/cowprotocol/cow-sdk/issues/511)) ([5629bb2](https://github.com/cowprotocol/cow-sdk/commit/5629bb25f89b62e490b9819393036994688bf648))
* release main ([#515](https://github.com/cowprotocol/cow-sdk/issues/515)) ([912e315](https://github.com/cowprotocol/cow-sdk/commit/912e31551440ebfa61d7d2f5c846d61162559448))
* release main ([#524](https://github.com/cowprotocol/cow-sdk/issues/524)) ([78c209b](https://github.com/cowprotocol/cow-sdk/commit/78c209bc5feeb90007bd9043dc5be861fed2d0ac))
* release main ([#532](https://github.com/cowprotocol/cow-sdk/issues/532)) ([762ebd8](https://github.com/cowprotocol/cow-sdk/commit/762ebd8a17fbec8a452e62c52e8efb5cd9d3070b))
* release main ([#534](https://github.com/cowprotocol/cow-sdk/issues/534)) ([cb65e65](https://github.com/cowprotocol/cow-sdk/commit/cb65e653925d0ef1942428738e74046b61c0020a))
* release main ([#536](https://github.com/cowprotocol/cow-sdk/issues/536)) ([05387ec](https://github.com/cowprotocol/cow-sdk/commit/05387ec18773858024caeaa456fd287c19dd7fd5))
* release main ([#538](https://github.com/cowprotocol/cow-sdk/issues/538)) ([d26fdab](https://github.com/cowprotocol/cow-sdk/commit/d26fdab92b320123695fa662df58fac161181bf7))
* release main ([#542](https://github.com/cowprotocol/cow-sdk/issues/542)) ([e9f98a6](https://github.com/cowprotocol/cow-sdk/commit/e9f98a623cf81f4a9246550999914c88eb1fca30))
* release main ([#567](https://github.com/cowprotocol/cow-sdk/issues/567)) ([3061f1e](https://github.com/cowprotocol/cow-sdk/commit/3061f1e4cfa56d8441515386ef06b67b0ef89edc))
* release main ([#571](https://github.com/cowprotocol/cow-sdk/issues/571)) ([43ae23d](https://github.com/cowprotocol/cow-sdk/commit/43ae23dd2b9972c13bf6976acdf2287205ea28d2))
* release main ([#573](https://github.com/cowprotocol/cow-sdk/issues/573)) ([cd5d917](https://github.com/cowprotocol/cow-sdk/commit/cd5d9170fad149f743c0f9bb991101de3b7d4e61))
* release main ([#575](https://github.com/cowprotocol/cow-sdk/issues/575)) ([2ef068b](https://github.com/cowprotocol/cow-sdk/commit/2ef068b851e5d114784f81ecbcd0fe3c512b7570))
* release main ([#581](https://github.com/cowprotocol/cow-sdk/issues/581)) ([0f09262](https://github.com/cowprotocol/cow-sdk/commit/0f0926297da8949de97379e7300a1e5301bde724))
* release main ([#592](https://github.com/cowprotocol/cow-sdk/issues/592)) ([e4d7212](https://github.com/cowprotocol/cow-sdk/commit/e4d7212af322beced743e985bd1fbedaef66cdcb))
* release main ([#596](https://github.com/cowprotocol/cow-sdk/issues/596)) ([9d8bfc9](https://github.com/cowprotocol/cow-sdk/commit/9d8bfc9ab1009b19ed08e1611b0ff310e116b1f8))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* test solve issue dependencies ([#548](https://github.com/cowprotocol/cow-sdk/issues/548)) ([451b049](https://github.com/cowprotocol/cow-sdk/commit/451b04974889398a2ef5dfae079ef58011bff1f6))
* use a better name for main packages ([#543](https://github.com/cowprotocol/cow-sdk/issues/543)) ([3c57f55](https://github.com/cowprotocol/cow-sdk/commit/3c57f553a88209b982959db15dba8740b7a5bb80))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 5.0.0
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.0.0
    * @cowprotocol/sdk-cow-shed bumped to 1.0.0
    * @cowprotocol/sdk-order-book bumped to 1.0.0
    * @cowprotocol/sdk-trading bumped to 1.0.0
    * @cowprotocol/sdk-weiroll bumped to 1.0.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0

## [0.5.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.5.0...sdk-bridging-v0.5.1) (2025-10-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.5
    * @cowprotocol/sdk-common bumped to 0.3.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.2
    * @cowprotocol/sdk-cow-shed bumped to 0.1.8
    * @cowprotocol/sdk-order-book bumped to 0.1.4
    * @cowprotocol/sdk-trading bumped to 0.4.3
    * @cowprotocol/sdk-weiroll bumped to 0.1.4
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.8
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.0

## [0.5.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.4.6...sdk-bridging-v0.5.0) (2025-10-24)


### ✨ Features

* allow other bridge provider families in CoW Swap: Recipient based ([#552](https://github.com/cowprotocol/cow-sdk/issues/552)) ([ae56511](https://github.com/cowprotocol/cow-sdk/commit/ae565112dd1fe107d7b297eddf529e07f06529fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.4
    * @cowprotocol/sdk-common bumped to 0.2.2
    * @cowprotocol/sdk-config bumped to 0.2.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.1
    * @cowprotocol/sdk-cow-shed bumped to 0.1.7
    * @cowprotocol/sdk-order-book bumped to 0.1.3
    * @cowprotocol/sdk-trading bumped to 0.4.2
    * @cowprotocol/sdk-weiroll bumped to 0.1.3
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.7
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.3

## [0.4.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.4.5...sdk-bridging-v0.4.6) (2025-10-17)


### 🔧 Miscellaneous

* release main ([#592](https://github.com/cowprotocol/cow-sdk/issues/592)) ([e4d7212](https://github.com/cowprotocol/cow-sdk/commit/e4d7212af322beced743e985bd1fbedaef66cdcb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.3
    * @cowprotocol/sdk-trading bumped to 0.4.1

## [0.4.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.4.4...sdk-bridging-v0.4.5) (2025-10-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.2
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.0
    * @cowprotocol/sdk-cow-shed bumped to 0.1.6
    * @cowprotocol/sdk-trading bumped to 0.4.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.6

## [0.4.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.4.3...sdk-bridging-v0.4.4) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.1
    * @cowprotocol/sdk-common bumped to 0.2.1
    * @cowprotocol/sdk-contracts-ts bumped to 0.3.1
    * @cowprotocol/sdk-cow-shed bumped to 0.1.5
    * @cowprotocol/sdk-order-book bumped to 0.1.2
    * @cowprotocol/sdk-trading bumped to 0.3.2
    * @cowprotocol/sdk-weiroll bumped to 0.1.2
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.5
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.2

## [0.4.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.4.2...sdk-bridging-v0.4.3) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.0
    * @cowprotocol/sdk-trading bumped to 0.3.1

## [0.4.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.4.1...sdk-bridging-v0.4.2) (2025-10-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.3.0

## [0.4.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.4.0...sdk-bridging-v0.4.1) (2025-10-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.2.1

## [0.4.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.3.3...sdk-bridging-v0.4.0) (2025-10-06)


### ✨ Features

* add caching to SDK Bridging ([#521](https://github.com/cowprotocol/cow-sdk/issues/521)) ([0c44212](https://github.com/cowprotocol/cow-sdk/commit/0c442121af74c297a002c7c0f608fb3396b9a446))
* autopublish to npm registry in GH ([#539](https://github.com/cowprotocol/cow-sdk/issues/539)) ([9e4a755](https://github.com/cowprotocol/cow-sdk/commit/9e4a7551b5e0a32a7a9e4ca3781ec088e16e25af))


### 🧪 Tests

* fix MultiQuoteStrategy flacky tests ([#540](https://github.com/cowprotocol/cow-sdk/issues/540)) ([aa0f90c](https://github.com/cowprotocol/cow-sdk/commit/aa0f90c04b2eaf6da08698e487dcdc62cb7ad8c1))


### 🔧 Miscellaneous

* add TODO to Across getDepositParams ([#560](https://github.com/cowprotocol/cow-sdk/issues/560)) ([16ebe8e](https://github.com/cowprotocol/cow-sdk/commit/16ebe8ea0b297bba949571102c1d0602a403f5ee))
* fix flaky test ([#547](https://github.com/cowprotocol/cow-sdk/issues/547)) ([4fb1861](https://github.com/cowprotocol/cow-sdk/commit/4fb18618c9d60387845cbb5741abafbbeed81991))
* test solve issue dependencies ([#548](https://github.com/cowprotocol/cow-sdk/issues/548)) ([451b049](https://github.com/cowprotocol/cow-sdk/commit/451b04974889398a2ef5dfae079ef58011bff1f6))
* use a better name for main packages ([#543](https://github.com/cowprotocol/cow-sdk/issues/543)) ([3c57f55](https://github.com/cowprotocol/cow-sdk/commit/3c57f553a88209b982959db15dba8740b7a5bb80))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.0.1
    * @cowprotocol/sdk-common bumped to 0.2.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.3.0
    * @cowprotocol/sdk-cow-shed bumped to 0.1.4
    * @cowprotocol/sdk-order-book bumped to 0.1.1
    * @cowprotocol/sdk-trading bumped to 0.2.0
    * @cowprotocol/sdk-weiroll bumped to 0.1.1
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.4
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.1

## [0.3.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.3.2...sdk-bridging-v0.3.3) (2025-09-24)


### 🐛 Bug Fixes

* **bridge:** fix Across tx explorer link ([#537](https://github.com/cowprotocol/cow-sdk/issues/537)) ([d76db02](https://github.com/cowprotocol/cow-sdk/commit/d76db02a53cebe6a18032293729d590affa0c38c))

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
