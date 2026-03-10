# Changelog

## [2.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v1.1.2...sdk-order-book-v2.0.0) (2026-03-10)


### ⚠ BREAKING CHANGES

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800))
* release cow-sdk v7

### ✨ Features

* add API endpoints for partners ([#809](https://github.com/cowprotocol/cow-sdk/issues/809)) ([59900e8](https://github.com/cowprotocol/cow-sdk/commit/59900e854a336e294ec881bd70bb13e579ff48ec))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* add offset & limit params to getTrades ([#713](https://github.com/cowprotocol/cow-sdk/issues/713)) ([3d3dde0](https://github.com/cowprotocol/cow-sdk/commit/3d3dde0a6d6b8e371fcba983c2bc06687bb6daeb))
* implement protocol fee ([#689](https://github.com/cowprotocol/cow-sdk/issues/689)) ([ec5bdad](https://github.com/cowprotocol/cow-sdk/commit/ec5bdada1ebf17afd42a9c8cabd617cf8be79d50))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))
* **order-book:** refact order-book ([fd74389](https://github.com/cowprotocol/cow-sdk/commit/fd74389aa22b52d260c38cde9b639ebac2d33997))
* **order-book:** setup order-book package, jest and tsconfig ([6ff4954](https://github.com/cowprotocol/cow-sdk/commit/6ff4954a7750f92a62ccaa430447b52bbb29843d))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* use trades v2 for pagination support ([#752](https://github.com/cowprotocol/cow-sdk/issues/752)) ([282169c](https://github.com/cowprotocol/cow-sdk/commit/282169c8cd9886f4488c30ddcc2f149b23e2e9ce))


### 🐛 Bug Fixes

* avoid protocol fee double-count in sell quotes ([#719](https://github.com/cowprotocol/cow-sdk/issues/719)) ([ad5b372](https://github.com/cowprotocol/cow-sdk/commit/ad5b37219f0c6ad61b84a9327d03a9610c41bd4e))
* **order-book:** handle decimal protocolFeeBps BigInt conversion ([#798](https://github.com/cowprotocol/cow-sdk/issues/798)) ([ad7d323](https://github.com/cowprotocol/cow-sdk/commit/ad7d32370c8bb1a414cf1e23a2f2f89e1f9e0b96))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))
* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800)) ([ea96f67](https://github.com/cowprotocol/cow-sdk/commit/ea96f67a6ff44b7cc9226dc8ab7991896ced3ca7))


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### 🔧 Miscellaneous

* fix main merge ([c1aa2b8](https://github.com/cowprotocol/cow-sdk/commit/c1aa2b81bd4e1b008b87a4207c8cf3358056ab1b))
* **order-book:** move order-book to monorepo package ([fd2dea1](https://github.com/cowprotocol/cow-sdk/commit/fd2dea15cc17d8f5d3366e3623957b62aa555a1a))
* release main ([#453](https://github.com/cowprotocol/cow-sdk/issues/453)) ([36080c1](https://github.com/cowprotocol/cow-sdk/commit/36080c1955f5f161bebce7867af110f6938e5c95))
* release main ([#486](https://github.com/cowprotocol/cow-sdk/issues/486)) ([cf53df2](https://github.com/cowprotocol/cow-sdk/commit/cf53df2d0f5e96a544165547958ecc959c1948d7))
* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))
* release main ([#491](https://github.com/cowprotocol/cow-sdk/issues/491)) ([bf28181](https://github.com/cowprotocol/cow-sdk/commit/bf281814844e0f9b5ad1cd1f5b12f89e6bea3a5a))
* release main ([#500](https://github.com/cowprotocol/cow-sdk/issues/500)) ([76c5185](https://github.com/cowprotocol/cow-sdk/commit/76c5185d4b827d185af11bef9435fbed87484b0b))
* release main ([#502](https://github.com/cowprotocol/cow-sdk/issues/502)) ([c452d8e](https://github.com/cowprotocol/cow-sdk/commit/c452d8e53bc0dcd79052b1877d2c48a32777093e))
* release main ([#503](https://github.com/cowprotocol/cow-sdk/issues/503)) ([532d8eb](https://github.com/cowprotocol/cow-sdk/commit/532d8eb2a0a0f9ec5775e566fe2507f1ccc4f961))
* release main ([#511](https://github.com/cowprotocol/cow-sdk/issues/511)) ([5629bb2](https://github.com/cowprotocol/cow-sdk/commit/5629bb25f89b62e490b9819393036994688bf648))
* release main ([#515](https://github.com/cowprotocol/cow-sdk/issues/515)) ([912e315](https://github.com/cowprotocol/cow-sdk/commit/912e31551440ebfa61d7d2f5c846d61162559448))
* release main ([#542](https://github.com/cowprotocol/cow-sdk/issues/542)) ([e9f98a6](https://github.com/cowprotocol/cow-sdk/commit/e9f98a623cf81f4a9246550999914c88eb1fca30))
* release main ([#575](https://github.com/cowprotocol/cow-sdk/issues/575)) ([2ef068b](https://github.com/cowprotocol/cow-sdk/commit/2ef068b851e5d114784f81ecbcd0fe3c512b7570))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#718](https://github.com/cowprotocol/cow-sdk/issues/718)) ([87683ec](https://github.com/cowprotocol/cow-sdk/commit/87683ecc507e59d70a6d623faba83cda65ca44cc))
* release main ([#720](https://github.com/cowprotocol/cow-sdk/issues/720)) ([c7348b8](https://github.com/cowprotocol/cow-sdk/commit/c7348b8eeaddb371c82631dbf94bfd8b0fb0209b))
* release main ([#721](https://github.com/cowprotocol/cow-sdk/issues/721)) ([d8cb9ec](https://github.com/cowprotocol/cow-sdk/commit/d8cb9ec16d16af35f8c2a1387b82fee472acd380))
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#754](https://github.com/cowprotocol/cow-sdk/issues/754)) ([3f2f53c](https://github.com/cowprotocol/cow-sdk/commit/3f2f53cdf66520d2f2c8fd82df2b614bc202eb6b))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#806](https://github.com/cowprotocol/cow-sdk/issues/806)) ([93d805f](https://github.com/cowprotocol/cow-sdk/commit/93d805fb93820b8c8ce2e2c2ce7f505243c1bd30))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#816](https://github.com/cowprotocol/cow-sdk/issues/816)) ([aad43b3](https://github.com/cowprotocol/cow-sdk/commit/aad43b32d795ad4f7b8d57e1cb06e3dd78458202))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))

## [1.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v1.1.1...sdk-order-book-v1.1.2) (2026-03-10)


### 🐛 Bug Fixes

* **order-book:** handle decimal protocolFeeBps BigInt conversion ([#798](https://github.com/cowprotocol/cow-sdk/issues/798)) ([ad7d323](https://github.com/cowprotocol/cow-sdk/commit/ad7d32370c8bb1a414cf1e23a2f2f89e1f9e0b96))

## [1.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v1.1.0...sdk-order-book-v1.1.1) (2026-03-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.10.0
    * @cowprotocol/sdk-common bumped to 0.7.0

## [1.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v1.0.0...sdk-order-book-v1.1.0) (2026-03-04)


### ✨ Features

* add API endpoints for partners ([#809](https://github.com/cowprotocol/cow-sdk/issues/809)) ([59900e8](https://github.com/cowprotocol/cow-sdk/commit/59900e854a336e294ec881bd70bb13e579ff48ec))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.9.0
    * @cowprotocol/sdk-common bumped to 0.6.3

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.6.6...sdk-order-book-v1.0.0) (2026-02-26)


### ⚠ BREAKING CHANGES

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800))

### 🐛 Bug Fixes

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800)) ([ea96f67](https://github.com/cowprotocol/cow-sdk/commit/ea96f67a6ff44b7cc9226dc8ab7991896ced3ca7))

## [0.6.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.6.5...sdk-order-book-v0.6.6) (2026-02-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.8.1
    * @cowprotocol/sdk-common bumped to 0.6.2

## [0.6.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.6.4...sdk-order-book-v0.6.5) (2026-02-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.8.0
    * @cowprotocol/sdk-common bumped to 0.6.1

## [0.6.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.6.3...sdk-order-book-v0.6.4) (2026-02-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.0

## [0.6.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.6.2...sdk-order-book-v0.6.3) (2026-02-02)


### 🔧 Miscellaneous

* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.7.3
    * @cowprotocol/sdk-common bumped to 0.5.4

## [0.6.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.6.1...sdk-order-book-v0.6.2) (2026-02-02)


### 🐛 Bug Fixes

* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.7.2
    * @cowprotocol/sdk-common bumped to 0.5.3

## [0.6.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.6.0...sdk-order-book-v0.6.1) (2026-01-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.7.1
    * @cowprotocol/sdk-common bumped to 0.5.2

## [0.6.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.5.1...sdk-order-book-v0.6.0) (2026-01-28)


### ✨ Features

* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.7.0
    * @cowprotocol/sdk-common bumped to 0.5.1

## [0.5.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.5.0...sdk-order-book-v0.5.1) (2026-01-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.6.3
    * @cowprotocol/sdk-common bumped to 0.5.0

## [0.5.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.4.4...sdk-order-book-v0.5.0) (2025-12-22)


### ✨ Features

* use trades v2 for pagination support ([#752](https://github.com/cowprotocol/cow-sdk/issues/752)) ([282169c](https://github.com/cowprotocol/cow-sdk/commit/282169c8cd9886f4488c30ddcc2f149b23e2e9ce))

## [0.4.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.4.3...sdk-order-book-v0.4.4) (2025-12-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.6.2

## [0.4.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.4.2...sdk-order-book-v0.4.3) (2025-12-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.6.1

## [0.4.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.4.1...sdk-order-book-v0.4.2) (2025-12-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.6.0

## [0.4.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.4.0...sdk-order-book-v0.4.1) (2025-12-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.5.0

## [0.4.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.3.2...sdk-order-book-v0.4.0) (2025-12-01)


### ✨ Features

* add offset & limit params to getTrades ([#713](https://github.com/cowprotocol/cow-sdk/issues/713)) ([3d3dde0](https://github.com/cowprotocol/cow-sdk/commit/3d3dde0a6d6b8e371fcba983c2bc06687bb6daeb))

## [0.3.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.3.1...sdk-order-book-v0.3.2) (2025-11-27)


### 🐛 Bug Fixes

* avoid protocol fee double-count in sell quotes ([#719](https://github.com/cowprotocol/cow-sdk/issues/719)) ([ad5b372](https://github.com/cowprotocol/cow-sdk/commit/ad5b37219f0c6ad61b84a9327d03a9610c41bd4e))

## [0.3.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.3.0...sdk-order-book-v0.3.1) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.4.1

## [0.3.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.2.0...sdk-order-book-v0.3.0) (2025-11-24)


### ✨ Features

* implement protocol fee ([#689](https://github.com/cowprotocol/cow-sdk/issues/689)) ([ec5bdad](https://github.com/cowprotocol/cow-sdk/commit/ec5bdada1ebf17afd42a9c8cabd617cf8be79d50))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.4.0
    * @cowprotocol/sdk-common bumped to 0.4.0

## [0.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.1.4...sdk-order-book-v0.2.0) (2025-11-05)


### ✨ Features

* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.0

## [0.1.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.1.3...sdk-order-book-v0.1.4) (2025-10-29)


### 🔧 Miscellaneous

* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0

## [0.1.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.1.2...sdk-order-book-v0.1.3) (2025-10-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.2.0
    * @cowprotocol/sdk-common bumped to 0.2.2

## [0.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.1.1...sdk-order-book-v0.1.2) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.1

## [0.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.1.0...sdk-order-book-v0.1.1) (2025-10-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.0

## [0.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.3.1-beta.0...sdk-order-book-v0.1.0) (2025-09-17)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.1.0
    * @cowprotocol/sdk-common bumped to 0.1.0

## [0.3.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.3.0-beta.0...sdk-order-book-v0.3.1-beta.0) (2025-09-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.0-beta.0

## [0.3.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.2.4-beta.0...sdk-order-book-v0.3.0-beta.0) (2025-09-16)


### ✨ Features

* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.3-beta.0
    * @cowprotocol/sdk-common bumped to 0.4.0-beta.0

## [0.2.4-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.2.3-beta.0...sdk-order-book-v0.2.4-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.2-beta.0

## [0.2.3-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.2.2-beta.0...sdk-order-book-v0.2.3-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.1-beta.0

## [0.2.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.2.1-beta.0...sdk-order-book-v0.2.2-beta.0) (2025-09-11)


### 🔧 Miscellaneous

* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0-beta.0

## [0.2.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.2.0-beta.0...sdk-order-book-v0.2.1-beta.0) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.0-beta.0

## [0.2.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v0.1.0-beta.0...sdk-order-book-v0.2.0-beta.0) (2025-08-28)


### ✨ Features

* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* **order-book:** refact order-book ([fd74389](https://github.com/cowprotocol/cow-sdk/commit/fd74389aa22b52d260c38cde9b639ebac2d33997))
* **order-book:** setup order-book package, jest and tsconfig ([6ff4954](https://github.com/cowprotocol/cow-sdk/commit/6ff4954a7750f92a62ccaa430447b52bbb29843d))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### 🔧 Miscellaneous

* fix main merge ([c1aa2b8](https://github.com/cowprotocol/cow-sdk/commit/c1aa2b81bd4e1b008b87a4207c8cf3358056ab1b))
* **order-book:** move order-book to monorepo package ([fd2dea1](https://github.com/cowprotocol/cow-sdk/commit/fd2dea15cc17d8f5d3366e3623957b62aa555a1a))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
