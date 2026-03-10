# Changelog

## [8.0.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.4.2...cow-sdk-v8.0.0) (2026-03-10)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* add API endpoints for partners ([#809](https://github.com/cowprotocol/cow-sdk/issues/809)) ([59900e8](https://github.com/cowprotocol/cow-sdk/commit/59900e854a336e294ec881bd70bb13e579ff48ec))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* **app-data:** add UTM Tracking for Developer Attribution ([#722](https://github.com/cowprotocol/cow-sdk/issues/722)) ([0cd79d1](https://github.com/cowprotocol/cow-sdk/commit/0cd79d185630cc44b111979e873e30c760904976))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))
* **lib-agnostic:** add nodejs examples for every adapter ([#440](https://github.com/cowprotocol/cow-sdk/issues/440)) ([43972e6](https://github.com/cowprotocol/cow-sdk/commit/43972e68ff728a9a882bbdc667b2c0821b273449))
* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* simplify OrderSigningUtils to use static methods only ([#417](https://github.com/cowprotocol/cow-sdk/issues/417)) ([899ca43](https://github.com/cowprotocol/cow-sdk/commit/899ca4325be831b6711468d1df3733d98fe913b0))


### 🐛 Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))


### 📚 Documentation

* update Low-Level SDK Usage Example ([#766](https://github.com/cowprotocol/cow-sdk/issues/766)) ([0b6949c](https://github.com/cowprotocol/cow-sdk/commit/0b6949cff628d390c17db8661cd917e486c75af3))
* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### 🔧 Miscellaneous

* bump sdk beta version ([#473](https://github.com/cowprotocol/cow-sdk/issues/473)) ([00142d3](https://github.com/cowprotocol/cow-sdk/commit/00142d3e524ebf7a023814ba91ee3a66ed796444))
* **docs:** apply PR suggestions and create subgraph README ([#406](https://github.com/cowprotocol/cow-sdk/issues/406)) ([d09a219](https://github.com/cowprotocol/cow-sdk/commit/d09a219c934289a30677be685915d57e9a4451be))
* fix TypeDoc Entry Point ([#509](https://github.com/cowprotocol/cow-sdk/issues/509)) ([82c2a11](https://github.com/cowprotocol/cow-sdk/commit/82c2a11599e517fee43c9e9506ee64a602160d09))
* make doc links absolute ([f03aabb](https://github.com/cowprotocol/cow-sdk/commit/f03aabb745e0cf51e3c9d5d8464f733e2668d544))
* release main ([#453](https://github.com/cowprotocol/cow-sdk/issues/453)) ([36080c1](https://github.com/cowprotocol/cow-sdk/commit/36080c1955f5f161bebce7867af110f6938e5c95))
* release main ([#474](https://github.com/cowprotocol/cow-sdk/issues/474)) ([02e47a4](https://github.com/cowprotocol/cow-sdk/commit/02e47a4af7a3d6c3d9d24aa15f30dde1b4672d7d))
* release main ([#486](https://github.com/cowprotocol/cow-sdk/issues/486)) ([cf53df2](https://github.com/cowprotocol/cow-sdk/commit/cf53df2d0f5e96a544165547958ecc959c1948d7))
* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))
* release main ([#491](https://github.com/cowprotocol/cow-sdk/issues/491)) ([bf28181](https://github.com/cowprotocol/cow-sdk/commit/bf281814844e0f9b5ad1cd1f5b12f89e6bea3a5a))
* release main ([#497](https://github.com/cowprotocol/cow-sdk/issues/497)) ([7d97945](https://github.com/cowprotocol/cow-sdk/commit/7d979459a2febdee59f98570fbd2271c4c61d0df))
* release main ([#500](https://github.com/cowprotocol/cow-sdk/issues/500)) ([76c5185](https://github.com/cowprotocol/cow-sdk/commit/76c5185d4b827d185af11bef9435fbed87484b0b))
* release main ([#502](https://github.com/cowprotocol/cow-sdk/issues/502)) ([c452d8e](https://github.com/cowprotocol/cow-sdk/commit/c452d8e53bc0dcd79052b1877d2c48a32777093e))
* release main ([#503](https://github.com/cowprotocol/cow-sdk/issues/503)) ([532d8eb](https://github.com/cowprotocol/cow-sdk/commit/532d8eb2a0a0f9ec5775e566fe2507f1ccc4f961))
* release main ([#505](https://github.com/cowprotocol/cow-sdk/issues/505)) ([0f98564](https://github.com/cowprotocol/cow-sdk/commit/0f985640c6e6f0852505cb3ad66c07bd3f23ea7b))
* release main ([#510](https://github.com/cowprotocol/cow-sdk/issues/510)) ([ffcfc88](https://github.com/cowprotocol/cow-sdk/commit/ffcfc889e02a7e832d4b55df0da8e2d814fee0b4))
* release main ([#511](https://github.com/cowprotocol/cow-sdk/issues/511)) ([5629bb2](https://github.com/cowprotocol/cow-sdk/commit/5629bb25f89b62e490b9819393036994688bf648))
* release main ([#515](https://github.com/cowprotocol/cow-sdk/issues/515)) ([912e315](https://github.com/cowprotocol/cow-sdk/commit/912e31551440ebfa61d7d2f5c846d61162559448))
* release main ([#524](https://github.com/cowprotocol/cow-sdk/issues/524)) ([78c209b](https://github.com/cowprotocol/cow-sdk/commit/78c209bc5feeb90007bd9043dc5be861fed2d0ac))
* release main ([#532](https://github.com/cowprotocol/cow-sdk/issues/532)) ([762ebd8](https://github.com/cowprotocol/cow-sdk/commit/762ebd8a17fbec8a452e62c52e8efb5cd9d3070b))
* release main ([#534](https://github.com/cowprotocol/cow-sdk/issues/534)) ([cb65e65](https://github.com/cowprotocol/cow-sdk/commit/cb65e653925d0ef1942428738e74046b61c0020a))
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
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#637](https://github.com/cowprotocol/cow-sdk/issues/637)) ([6909e8d](https://github.com/cowprotocol/cow-sdk/commit/6909e8d5e97afadc203be2293865bfb2f9338953))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#650](https://github.com/cowprotocol/cow-sdk/issues/650)) ([2493612](https://github.com/cowprotocol/cow-sdk/commit/24936120e51b0083eda408ab80b8f8ee4115e223))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#702](https://github.com/cowprotocol/cow-sdk/issues/702)) ([1e6b54d](https://github.com/cowprotocol/cow-sdk/commit/1e6b54dbaef21a61c362bc2d1567d87f14d7f8a7))
* release main ([#718](https://github.com/cowprotocol/cow-sdk/issues/718)) ([87683ec](https://github.com/cowprotocol/cow-sdk/commit/87683ecc507e59d70a6d623faba83cda65ca44cc))
* release main ([#720](https://github.com/cowprotocol/cow-sdk/issues/720)) ([c7348b8](https://github.com/cowprotocol/cow-sdk/commit/c7348b8eeaddb371c82631dbf94bfd8b0fb0209b))
* release main ([#721](https://github.com/cowprotocol/cow-sdk/issues/721)) ([d8cb9ec](https://github.com/cowprotocol/cow-sdk/commit/d8cb9ec16d16af35f8c2a1387b82fee472acd380))
* release main ([#726](https://github.com/cowprotocol/cow-sdk/issues/726)) ([a6a51e6](https://github.com/cowprotocol/cow-sdk/commit/a6a51e6ec3edd9fdb6c1384070ad24a5cac3cb98))
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#741](https://github.com/cowprotocol/cow-sdk/issues/741)) ([32fb8bb](https://github.com/cowprotocol/cow-sdk/commit/32fb8bbe6b1172c2666f330d0d50cdc2f7c2554f))
* release main ([#742](https://github.com/cowprotocol/cow-sdk/issues/742)) ([8c8d857](https://github.com/cowprotocol/cow-sdk/commit/8c8d857e9c9da59b8793f2f9dfb3ca075891e6e3))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#751](https://github.com/cowprotocol/cow-sdk/issues/751)) ([885d7f7](https://github.com/cowprotocol/cow-sdk/commit/885d7f707bf2074dfb80df6ebcf41c12515695e3))
* release main ([#754](https://github.com/cowprotocol/cow-sdk/issues/754)) ([3f2f53c](https://github.com/cowprotocol/cow-sdk/commit/3f2f53cdf66520d2f2c8fd82df2b614bc202eb6b))
* release main ([#762](https://github.com/cowprotocol/cow-sdk/issues/762)) ([349f758](https://github.com/cowprotocol/cow-sdk/commit/349f758ea15d358e737fb50abdbfaa56fe617316))
* release main ([#764](https://github.com/cowprotocol/cow-sdk/issues/764)) ([eb71e9d](https://github.com/cowprotocol/cow-sdk/commit/eb71e9dba6efedb1eff3c5039f1b07bd0554418b))
* release main ([#767](https://github.com/cowprotocol/cow-sdk/issues/767)) ([79bcc27](https://github.com/cowprotocol/cow-sdk/commit/79bcc271e10ab90de6edfbba6a96530f994fdd80))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#778](https://github.com/cowprotocol/cow-sdk/issues/778)) ([d84e4a3](https://github.com/cowprotocol/cow-sdk/commit/d84e4a3a5d918a6ba28879a20798510eb84cbf12))
* release main ([#779](https://github.com/cowprotocol/cow-sdk/issues/779)) ([6387df5](https://github.com/cowprotocol/cow-sdk/commit/6387df570750f4411ad57e3aed709b4eb848557c))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#791](https://github.com/cowprotocol/cow-sdk/issues/791)) ([3a66cda](https://github.com/cowprotocol/cow-sdk/commit/3a66cdaf4153c98bb115774e1694cc516509a0c2))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#806](https://github.com/cowprotocol/cow-sdk/issues/806)) ([93d805f](https://github.com/cowprotocol/cow-sdk/commit/93d805fb93820b8c8ce2e2c2ce7f505243c1bd30))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#816](https://github.com/cowprotocol/cow-sdk/issues/816)) ([aad43b3](https://github.com/cowprotocol/cow-sdk/commit/aad43b32d795ad4f7b8d57e1cb06e3dd78458202))
* remove `under development` comment from Linea and Plasma ([#770](https://github.com/cowprotocol/cow-sdk/issues/770)) ([cbb5361](https://github.com/cowprotocol/cow-sdk/commit/cbb53611674553e40d42ffcb3d0f599f49ec2fa1))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 2.0.0
    * @cowprotocol/sdk-order-signing bumped to 1.0.0
    * @cowprotocol/sdk-trading bumped to 2.0.0

## [7.4.2](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.4.1...cow-sdk-v7.4.2) (2026-03-10)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 1.1.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.37
    * @cowprotocol/sdk-trading bumped to 1.0.3

## [7.4.1](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.4.0...cow-sdk-v7.4.1) (2026-03-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.7
    * @cowprotocol/sdk-common bumped to 0.7.0
    * @cowprotocol/sdk-config bumped to 0.10.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.8.0
    * @cowprotocol/sdk-order-book bumped to 1.1.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.36
    * @cowprotocol/sdk-trading bumped to 1.0.2

## [7.4.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.3.8...cow-sdk-v7.4.0) (2026-03-04)


### ✨ Features

* add API endpoints for partners ([#809](https://github.com/cowprotocol/cow-sdk/issues/809)) ([59900e8](https://github.com/cowprotocol/cow-sdk/commit/59900e854a336e294ec881bd70bb13e579ff48ec))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.6
    * @cowprotocol/sdk-common bumped to 0.6.3
    * @cowprotocol/sdk-config bumped to 0.9.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.7.0
    * @cowprotocol/sdk-order-book bumped to 1.1.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.35
    * @cowprotocol/sdk-trading bumped to 1.0.1

## [7.3.8](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.3.7...cow-sdk-v7.3.8) (2026-02-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 1.0.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.34
    * @cowprotocol/sdk-trading bumped to 1.0.0

## [7.3.7](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.3.6...cow-sdk-v7.3.7) (2026-02-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.5
    * @cowprotocol/sdk-common bumped to 0.6.2
    * @cowprotocol/sdk-config bumped to 0.8.1
    * @cowprotocol/sdk-contracts-ts bumped to 1.6.1
    * @cowprotocol/sdk-order-book bumped to 0.6.6
    * @cowprotocol/sdk-order-signing bumped to 0.1.33
    * @cowprotocol/sdk-trading bumped to 0.11.1

## [7.3.6](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.3.5...cow-sdk-v7.3.6) (2026-02-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.4
    * @cowprotocol/sdk-common bumped to 0.6.1
    * @cowprotocol/sdk-config bumped to 0.8.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.6.0
    * @cowprotocol/sdk-order-book bumped to 0.6.5
    * @cowprotocol/sdk-order-signing bumped to 0.1.32
    * @cowprotocol/sdk-trading bumped to 0.11.0

## [7.3.5](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.3.4...cow-sdk-v7.3.5) (2026-02-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.3
    * @cowprotocol/sdk-common bumped to 0.6.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.5.0
    * @cowprotocol/sdk-order-book bumped to 0.6.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.31
    * @cowprotocol/sdk-trading bumped to 0.10.1

## [7.3.4](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.3.3...cow-sdk-v7.3.4) (2026-02-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.10.0

## [7.3.3](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.3.2...cow-sdk-v7.3.3) (2026-02-02)


### 🔧 Miscellaneous

* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.2
    * @cowprotocol/sdk-common bumped to 0.5.4
    * @cowprotocol/sdk-config bumped to 0.7.3
    * @cowprotocol/sdk-contracts-ts bumped to 1.4.2
    * @cowprotocol/sdk-order-book bumped to 0.6.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.30
    * @cowprotocol/sdk-trading bumped to 0.9.4

## [7.3.2](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.3.1...cow-sdk-v7.3.2) (2026-02-02)


### 🐛 Bug Fixes

* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.1
    * @cowprotocol/sdk-common bumped to 0.5.3
    * @cowprotocol/sdk-config bumped to 0.7.2
    * @cowprotocol/sdk-contracts-ts bumped to 1.4.1
    * @cowprotocol/sdk-order-book bumped to 0.6.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.29
    * @cowprotocol/sdk-trading bumped to 0.9.3

## [7.3.1](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.3.0...cow-sdk-v7.3.1) (2026-01-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.0
    * @cowprotocol/sdk-common bumped to 0.5.2
    * @cowprotocol/sdk-config bumped to 0.7.1
    * @cowprotocol/sdk-contracts-ts bumped to 1.4.0
    * @cowprotocol/sdk-order-book bumped to 0.6.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.28
    * @cowprotocol/sdk-trading bumped to 0.9.2

## [7.3.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.13...cow-sdk-v7.3.0) (2026-01-28)


### ✨ Features

* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.5.2
    * @cowprotocol/sdk-common bumped to 0.5.1
    * @cowprotocol/sdk-config bumped to 0.7.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.3.0
    * @cowprotocol/sdk-order-book bumped to 0.6.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.27
    * @cowprotocol/sdk-trading bumped to 0.9.1

## [7.2.13](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.12...cow-sdk-v7.2.13) (2026-01-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 1.2.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.26
    * @cowprotocol/sdk-trading bumped to 0.9.0

## [7.2.12](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.11...cow-sdk-v7.2.12) (2026-01-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 1.1.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.25
    * @cowprotocol/sdk-trading bumped to 0.8.2

## [7.2.11](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.10...cow-sdk-v7.2.11) (2026-01-19)


### 🔧 Miscellaneous

* remove `under development` comment from Linea and Plasma ([#770](https://github.com/cowprotocol/cow-sdk/issues/770)) ([cbb5361](https://github.com/cowprotocol/cow-sdk/commit/cbb53611674553e40d42ffcb3d0f599f49ec2fa1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.5.1
    * @cowprotocol/sdk-common bumped to 0.5.0
    * @cowprotocol/sdk-config bumped to 0.6.3
    * @cowprotocol/sdk-contracts-ts bumped to 1.1.0
    * @cowprotocol/sdk-order-book bumped to 0.5.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.24
    * @cowprotocol/sdk-trading bumped to 0.8.1

## [7.2.10](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.9...cow-sdk-v7.2.10) (2026-01-15)


### 📚 Documentation

* update Low-Level SDK Usage Example ([#766](https://github.com/cowprotocol/cow-sdk/issues/766)) ([0b6949c](https://github.com/cowprotocol/cow-sdk/commit/0b6949cff628d390c17db8661cd917e486c75af3))

## [7.2.9](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.8...cow-sdk-v7.2.9) (2025-12-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.5.0
    * @cowprotocol/sdk-trading bumped to 0.8.0

## [7.2.8](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.7...cow-sdk-v7.2.8) (2025-12-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.7.4

## [7.2.7](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.6...cow-sdk-v7.2.7) (2025-12-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.4.0
    * @cowprotocol/sdk-order-book bumped to 0.5.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.23
    * @cowprotocol/sdk-trading bumped to 0.7.3

## [7.2.6](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.5...cow-sdk-v7.2.6) (2025-12-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 1.0.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.22
    * @cowprotocol/sdk-trading bumped to 0.7.2

## [7.2.5](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.4...cow-sdk-v7.2.5) (2025-12-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.6
    * @cowprotocol/sdk-config bumped to 0.6.2
    * @cowprotocol/sdk-contracts-ts bumped to 0.8.1
    * @cowprotocol/sdk-order-book bumped to 0.4.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.21
    * @cowprotocol/sdk-trading bumped to 0.7.1

## [7.2.4](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.3...cow-sdk-v7.2.4) (2025-12-10)


### 🔧 Miscellaneous

* release main ([#741](https://github.com/cowprotocol/cow-sdk/issues/741)) ([32fb8bb](https://github.com/cowprotocol/cow-sdk/commit/32fb8bbe6b1172c2666f330d0d50cdc2f7c2554f))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.8.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.20
    * @cowprotocol/sdk-trading bumped to 0.7.0

## [7.2.3](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.2...cow-sdk-v7.2.3) (2025-12-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.5
    * @cowprotocol/sdk-config bumped to 0.6.1
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.4
    * @cowprotocol/sdk-order-book bumped to 0.4.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.19
    * @cowprotocol/sdk-trading bumped to 0.6.3

## [7.2.2](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.1...cow-sdk-v7.2.2) (2025-12-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.4
    * @cowprotocol/sdk-config bumped to 0.6.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.3
    * @cowprotocol/sdk-order-book bumped to 0.4.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.18
    * @cowprotocol/sdk-trading bumped to 0.6.2

## [7.2.1](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.2.0...cow-sdk-v7.2.1) (2025-12-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.3
    * @cowprotocol/sdk-config bumped to 0.5.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.2
    * @cowprotocol/sdk-order-book bumped to 0.4.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.17
    * @cowprotocol/sdk-trading bumped to 0.6.1

## [7.2.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.6...cow-sdk-v7.2.0) (2025-12-03)


### ✨ Features

* **app-data:** add UTM Tracking for Developer Attribution ([#722](https://github.com/cowprotocol/cow-sdk/issues/722)) ([0cd79d1](https://github.com/cowprotocol/cow-sdk/commit/0cd79d185630cc44b111979e873e30c760904976))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.2
    * @cowprotocol/sdk-trading bumped to 0.6.0

## [7.1.6](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.5...cow-sdk-v7.1.6) (2025-12-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 0.4.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.16
    * @cowprotocol/sdk-trading bumped to 0.5.4

## [7.1.5](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.4...cow-sdk-v7.1.5) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 0.3.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.15
    * @cowprotocol/sdk-trading bumped to 0.5.3

## [7.1.4](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.3...cow-sdk-v7.1.4) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.1
    * @cowprotocol/sdk-config bumped to 0.4.1
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.1
    * @cowprotocol/sdk-order-book bumped to 0.3.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.14
    * @cowprotocol/sdk-trading bumped to 0.5.2

## [7.1.3](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.2...cow-sdk-v7.1.3) (2025-11-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.13
    * @cowprotocol/sdk-trading bumped to 0.5.1

## [7.1.2](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.1...cow-sdk-v7.1.2) (2025-11-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.2.0
    * @cowprotocol/sdk-common bumped to 0.4.0
    * @cowprotocol/sdk-config bumped to 0.4.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.6.0
    * @cowprotocol/sdk-order-book bumped to 0.3.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.12
    * @cowprotocol/sdk-trading bumped to 0.5.0

## [7.1.1](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.0...cow-sdk-v7.1.1) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.5.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.11
    * @cowprotocol/sdk-trading bumped to 0.4.6

## [7.1.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.13...cow-sdk-v7.1.0) (2025-11-05)


### ✨ Features

* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.6
    * @cowprotocol/sdk-config bumped to 0.3.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.4
    * @cowprotocol/sdk-order-book bumped to 0.2.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.10
    * @cowprotocol/sdk-trading bumped to 0.4.5

## [7.0.13](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.12...cow-sdk-v7.0.13) (2025-10-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.9
    * @cowprotocol/sdk-trading bumped to 0.4.4

## [7.0.12](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.11...cow-sdk-v7.0.12) (2025-10-29)


### 🔧 Miscellaneous

* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.5
    * @cowprotocol/sdk-common bumped to 0.3.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.2
    * @cowprotocol/sdk-order-book bumped to 0.1.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.8
    * @cowprotocol/sdk-trading bumped to 0.4.3

## [7.0.11](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.10...cow-sdk-v7.0.11) (2025-10-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.4
    * @cowprotocol/sdk-common bumped to 0.2.2
    * @cowprotocol/sdk-config bumped to 0.2.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.1
    * @cowprotocol/sdk-order-book bumped to 0.1.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.7
    * @cowprotocol/sdk-trading bumped to 0.4.2

## [7.0.10](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.9...cow-sdk-v7.0.10) (2025-10-17)


### 🔧 Miscellaneous

* release main ([#592](https://github.com/cowprotocol/cow-sdk/issues/592)) ([e4d7212](https://github.com/cowprotocol/cow-sdk/commit/e4d7212af322beced743e985bd1fbedaef66cdcb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.3
    * @cowprotocol/sdk-trading bumped to 0.4.1

## [7.0.9](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.8...cow-sdk-v7.0.9) (2025-10-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.2
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.6
    * @cowprotocol/sdk-trading bumped to 0.4.0

## [7.0.8](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.7...cow-sdk-v7.0.8) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.1
    * @cowprotocol/sdk-common bumped to 0.2.1
    * @cowprotocol/sdk-contracts-ts bumped to 0.3.1
    * @cowprotocol/sdk-order-book bumped to 0.1.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.5
    * @cowprotocol/sdk-trading bumped to 0.3.2

## [7.0.7](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.6...cow-sdk-v7.0.7) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.0
    * @cowprotocol/sdk-trading bumped to 0.3.1

## [7.0.6](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.5...cow-sdk-v7.0.6) (2025-10-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.3.0

## [7.0.5](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.4...cow-sdk-v7.0.5) (2025-10-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.2.1

## [7.0.4](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.3...cow-sdk-v7.0.4) (2025-10-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.0.1
    * @cowprotocol/sdk-common bumped to 0.2.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.3.0
    * @cowprotocol/sdk-order-book bumped to 0.1.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.4
    * @cowprotocol/sdk-trading bumped to 0.2.0

## [7.0.3](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.2...cow-sdk-v7.0.3) (2025-09-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.2.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.3
    * @cowprotocol/sdk-trading bumped to 0.1.3

## [7.0.2](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.1...cow-sdk-v7.0.2) (2025-09-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.2.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.2
    * @cowprotocol/sdk-trading bumped to 0.1.2

## [7.0.1](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.0...cow-sdk-v7.0.1) (2025-09-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.1.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.1
    * @cowprotocol/sdk-trading bumped to 0.1.1

## [7.0.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.3-beta.0...cow-sdk-v7.0.0) (2025-09-17)


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
    * @cowprotocol/sdk-order-book bumped to 0.1.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.0
    * @cowprotocol/sdk-trading bumped to 0.1.0

## [7.1.3-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.2-beta.0...cow-sdk-v7.1.3-beta.0) (2025-09-17)


### 🔧 Miscellaneous

* make doc links absolute ([f03aabb](https://github.com/cowprotocol/cow-sdk/commit/f03aabb745e0cf51e3c9d5d8464f733e2668d544))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.7-beta.0
    * @cowprotocol/sdk-common bumped to 0.5.0-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.3.0-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.3.1-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.8-beta.0
    * @cowprotocol/sdk-trading bumped to 0.3.2-beta.0

## [7.1.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.1-beta.0...cow-sdk-v7.1.2-beta.0) (2025-09-16)


### 🔧 Miscellaneous

* fix TypeDoc Entry Point ([#509](https://github.com/cowprotocol/cow-sdk/issues/509)) ([82c2a11](https://github.com/cowprotocol/cow-sdk/commit/82c2a11599e517fee43c9e9506ee64a602160d09))

## [7.1.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.1.0-beta.0...cow-sdk-v7.1.1-beta.0) (2025-09-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.6-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.2.1-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.7-beta.0
    * @cowprotocol/sdk-trading bumped to 0.3.1-beta.0

## [7.1.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.6-beta.0...cow-sdk-v7.1.0-beta.0) (2025-09-16)


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
    * @cowprotocol/sdk-order-book bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.6-beta.0
    * @cowprotocol/sdk-trading bumped to 0.3.0-beta.0

## [7.0.6-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.5-beta.0...cow-sdk-v7.0.6-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.4-beta.0
    * @cowprotocol/sdk-bridging bumped to 0.2.6-beta.0
    * @cowprotocol/sdk-composable bumped to 0.2.6-beta.0
    * @cowprotocol/sdk-config bumped to 0.3.2-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.7-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-subgraph bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.6-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.4-beta.0

## [7.0.5-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.4-beta.0...cow-sdk-v7.0.5-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.3-beta.0
    * @cowprotocol/sdk-bridging bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-composable bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-config bumped to 0.3.1-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.6-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-subgraph bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.3-beta.0

## [7.0.4-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.3-beta.0...cow-sdk-v7.0.4-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-bridging bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-composable bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.5-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.4-beta.0

## [7.0.3-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.2-beta.0...cow-sdk-v7.0.3-beta.0) (2025-09-11)


### 🔧 Miscellaneous

* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.2-beta.0
    * @cowprotocol/sdk-bridging bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-common bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-composable bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.4-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-subgraph bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.2-beta.0

## [7.0.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.1-beta.0...cow-sdk-v7.0.2-beta.0) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.1-beta.0
    * @cowprotocol/sdk-bridging bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-composable bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-config bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.3-beta.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.1-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.1-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.1-beta.0
    * @cowprotocol/sdk-subgraph bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-trading bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-weiroll bumped to 0.2.1-beta.0

## [7.0.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v7.0.0-beta.0...cow-sdk-v7.0.1-beta.0) (2025-09-04)


### 🔧 Miscellaneous

* bump sdk beta version ([#473](https://github.com/cowprotocol/cow-sdk/issues/473)) ([00142d3](https://github.com/cowprotocol/cow-sdk/commit/00142d3e524ebf7a023814ba91ee3a66ed796444))

## [7.0.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v6.3.2...cow-sdk-v7.0.0-beta.0) (2025-08-28)


### ✨ Features

* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **lib-agnostic:** add nodejs examples for every adapter ([#440](https://github.com/cowprotocol/cow-sdk/issues/440)) ([43972e6](https://github.com/cowprotocol/cow-sdk/commit/43972e68ff728a9a882bbdc667b2c0821b273449))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* simplify OrderSigningUtils to use static methods only ([#417](https://github.com/cowprotocol/cow-sdk/issues/417)) ([899ca43](https://github.com/cowprotocol/cow-sdk/commit/899ca4325be831b6711468d1df3733d98fe913b0))


### 🐛 Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))


### 🔧 Miscellaneous

* **docs:** apply PR suggestions and create subgraph README ([#406](https://github.com/cowprotocol/cow-sdk/issues/406)) ([d09a219](https://github.com/cowprotocol/cow-sdk/commit/d09a219c934289a30677be685915d57e9a4451be))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
