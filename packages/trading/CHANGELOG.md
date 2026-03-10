# Changelog

## [2.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v1.0.3...sdk-trading-v2.0.0) (2026-03-10)


### ⚠ BREAKING CHANGES

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800))
* release cow-sdk v7

### ✨ Features

* add a basic example of tradingSDK with Ethers5 ([#437](https://github.com/cowprotocol/cow-sdk/issues/437)) ([61e11a1](https://github.com/cowprotocol/cow-sdk/commit/61e11a11c8650e6a29fe8c9d9a795e3aff02030a))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* **app-data:** add user terms consents ([#763](https://github.com/cowprotocol/cow-sdk/issues/763)) ([1fc0b26](https://github.com/cowprotocol/cow-sdk/commit/1fc0b26ba250505db19c9189dd52a5e021c9616e))
* **app-data:** add UTM Tracking for Developer Attribution ([#722](https://github.com/cowprotocol/cow-sdk/issues/722)) ([0cd79d1](https://github.com/cowprotocol/cow-sdk/commit/0cd79d185630cc44b111979e873e30c760904976))
* **bridge:** add a flag to control intermediate=sell token ([#777](https://github.com/cowprotocol/cow-sdk/issues/777)) ([588dffa](https://github.com/cowprotocol/cow-sdk/commit/588dffaf418b8220293fe803186e3801597282d0))
* **bridge:** determine intermediate token ([#738](https://github.com/cowprotocol/cow-sdk/issues/738)) ([381e885](https://github.com/cowprotocol/cow-sdk/commit/381e885d398623cfd731b439e7e62e8b863736c8))
* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))
* **deprecated-chains:** add isDeprecated flag and mark Lens as such ([#801](https://github.com/cowprotocol/cow-sdk/issues/801)) ([e0663c6](https://github.com/cowprotocol/cow-sdk/commit/e0663c69c0b5d92bae45570f27105d6cfd04b96a))
* implement protocol fee ([#689](https://github.com/cowprotocol/cow-sdk/issues/689)) ([ec5bdad](https://github.com/cowprotocol/cow-sdk/commit/ec5bdada1ebf17afd42a9c8cabd617cf8be79d50))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* **trading:** add methods to approve and check allowance ([#570](https://github.com/cowprotocol/cow-sdk/issues/570)) ([fc44e8b](https://github.com/cowprotocol/cow-sdk/commit/fc44e8bf602634194bed672ca20dcc4a8ff07446))
* **trading:** add methods to cancel order ([#569](https://github.com/cowprotocol/cow-sdk/issues/569)) ([4735d47](https://github.com/cowprotocol/cow-sdk/commit/4735d47575ce1092f4213e579f752c3ac4ed9f7b))
* **trading:** add validTo parameter to getQuote ([#576](https://github.com/cowprotocol/cow-sdk/issues/576)) ([fcf4258](https://github.com/cowprotocol/cow-sdk/commit/fcf425806044c0ea8b83cfb4116d2f7fb9fcc6e0))
* **trading:** allow quoting without signer ([#799](https://github.com/cowprotocol/cow-sdk/issues/799)) ([6db2612](https://github.com/cowprotocol/cow-sdk/commit/6db2612da19635c579ec10f4ac0304c0efa76005))
* **trading:** upload appData before order signing ([#786](https://github.com/cowprotocol/cow-sdk/issues/786)) ([de819d1](https://github.com/cowprotocol/cow-sdk/commit/de819d183531d938daf165809ef0cf9ef2537f58))
* **trading:** use suggested slippage from BFF ([#546](https://github.com/cowprotocol/cow-sdk/issues/546)) ([b6a59c7](https://github.com/cowprotocol/cow-sdk/commit/b6a59c780fbfb0f2e840276fe905b2efd810805c))


### 🐛 Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* **bridge:** fix applying affiliate header ([#492](https://github.com/cowprotocol/cow-sdk/issues/492)) ([e4f49c6](https://github.com/cowprotocol/cow-sdk/commit/e4f49c64e60f4aeac97b6b246c36090946df6fcf))
* change applyCostsSlippageAndFees default for limit orders ([#760](https://github.com/cowprotocol/cow-sdk/issues/760)) ([d10c17b](https://github.com/cowprotocol/cow-sdk/commit/d10c17b10097616a4e042b04a862bc6cb3b1b0af))
* flashloan fee calculation now matches aave's ([#622](https://github.com/cowprotocol/cow-sdk/issues/622)) ([8d11b7f](https://github.com/cowprotocol/cow-sdk/commit/8d11b7fbbc8ff797253f26772a0e5c940286f2d9))
* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **networks:** remove deprecated network check/error from trading sdk ([#804](https://github.com/cowprotocol/cow-sdk/issues/804)) ([210d26e](https://github.com/cowprotocol/cow-sdk/commit/210d26e556fd79c8a3ac7b8f45f33e766ade4e18))
* **order-book:** handle decimal protocolFeeBps BigInt conversion ([#798](https://github.com/cowprotocol/cow-sdk/issues/798)) ([ad7d323](https://github.com/cowprotocol/cow-sdk/commit/ad7d32370c8bb1a414cf1e23a2f2f89e1f9e0b96))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))
* **slippage:** reduce lower cap from 0.5 to 0% ([#565](https://github.com/cowprotocol/cow-sdk/issues/565)) ([302fb72](https://github.com/cowprotocol/cow-sdk/commit/302fb72d1fca80edb7acdf83a6987991a7e487e3))
* **slippage:** use volatility slippage to calculate volume slippage ([#574](https://github.com/cowprotocol/cow-sdk/issues/574)) ([0d86551](https://github.com/cowprotocol/cow-sdk/commit/0d8655153199707bed13b8303dac4a7c5d50a57a))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))
* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))
* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800)) ([ea96f67](https://github.com/cowprotocol/cow-sdk/commit/ea96f67a6ff44b7cc9226dc8ab7991896ced3ca7))


### 📚 Documentation

* add link to cancel order doc ([#580](https://github.com/cowprotocol/cow-sdk/issues/580)) ([9764178](https://github.com/cowprotocol/cow-sdk/commit/97641785500141c7e68a96483f17a624724b5386))
* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### 🔧 Miscellaneous

* fix main merge ([c1aa2b8](https://github.com/cowprotocol/cow-sdk/commit/c1aa2b81bd4e1b008b87a4207c8cf3358056ab1b))
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
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 2.0.0
    * @cowprotocol/sdk-order-signing bumped to 1.0.0

## [1.0.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v1.0.2...sdk-trading-v1.0.3) (2026-03-10)


### 🐛 Bug Fixes

* **order-book:** handle decimal protocolFeeBps BigInt conversion ([#798](https://github.com/cowprotocol/cow-sdk/issues/798)) ([ad7d323](https://github.com/cowprotocol/cow-sdk/commit/ad7d32370c8bb1a414cf1e23a2f2f89e1f9e0b96))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 1.1.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.37

## [1.0.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v1.0.1...sdk-trading-v1.0.2) (2026-03-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.7.0
    * @cowprotocol/sdk-config bumped to 0.10.0
    * @cowprotocol/sdk-app-data bumped to 4.6.7
    * @cowprotocol/sdk-order-book bumped to 1.1.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.36
    * @cowprotocol/sdk-contracts-ts bumped to 1.8.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.10
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.10
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.10

## [1.0.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v1.0.0...sdk-trading-v1.0.1) (2026-03-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.3
    * @cowprotocol/sdk-config bumped to 0.9.0
    * @cowprotocol/sdk-app-data bumped to 4.6.6
    * @cowprotocol/sdk-order-book bumped to 1.1.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.35
    * @cowprotocol/sdk-contracts-ts bumped to 1.7.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.9
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.9
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.9

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.11.1...sdk-trading-v1.0.0) (2026-02-26)


### ⚠ BREAKING CHANGES

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800))

### ✨ Features

* **trading:** allow quoting without signer ([#799](https://github.com/cowprotocol/cow-sdk/issues/799)) ([6db2612](https://github.com/cowprotocol/cow-sdk/commit/6db2612da19635c579ec10f4ac0304c0efa76005))


### 🐛 Bug Fixes

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800)) ([ea96f67](https://github.com/cowprotocol/cow-sdk/commit/ea96f67a6ff44b7cc9226dc8ab7991896ced3ca7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 1.0.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.34

## [0.11.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.11.0...sdk-trading-v0.11.1) (2026-02-20)


### 🐛 Bug Fixes

* **networks:** remove deprecated network check/error from trading sdk ([#804](https://github.com/cowprotocol/cow-sdk/issues/804)) ([210d26e](https://github.com/cowprotocol/cow-sdk/commit/210d26e556fd79c8a3ac7b8f45f33e766ade4e18))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.2
    * @cowprotocol/sdk-config bumped to 0.8.1
    * @cowprotocol/sdk-app-data bumped to 4.6.5
    * @cowprotocol/sdk-order-book bumped to 0.6.6
    * @cowprotocol/sdk-order-signing bumped to 0.1.33
    * @cowprotocol/sdk-contracts-ts bumped to 1.6.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.8
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.8
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.8

## [0.11.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.10.1...sdk-trading-v0.11.0) (2026-02-18)


### ✨ Features

* **deprecated-chains:** add isDeprecated flag and mark Lens as such ([#801](https://github.com/cowprotocol/cow-sdk/issues/801)) ([e0663c6](https://github.com/cowprotocol/cow-sdk/commit/e0663c69c0b5d92bae45570f27105d6cfd04b96a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.1
    * @cowprotocol/sdk-config bumped to 0.8.0
    * @cowprotocol/sdk-app-data bumped to 4.6.4
    * @cowprotocol/sdk-order-book bumped to 0.6.5
    * @cowprotocol/sdk-order-signing bumped to 0.1.32
    * @cowprotocol/sdk-contracts-ts bumped to 1.6.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.7
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.7
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.7

## [0.10.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.10.0...sdk-trading-v0.10.1) (2026-02-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.0
    * @cowprotocol/sdk-app-data bumped to 4.6.3
    * @cowprotocol/sdk-order-book bumped to 0.6.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.31
    * @cowprotocol/sdk-contracts-ts bumped to 1.5.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.6
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.6
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.6

## [0.10.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.9.4...sdk-trading-v0.10.0) (2026-02-03)


### ✨ Features

* **trading:** upload appData before order signing ([#786](https://github.com/cowprotocol/cow-sdk/issues/786)) ([de819d1](https://github.com/cowprotocol/cow-sdk/commit/de819d183531d938daf165809ef0cf9ef2537f58))

## [0.9.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.9.3...sdk-trading-v0.9.4) (2026-02-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.4
    * @cowprotocol/sdk-config bumped to 0.7.3
    * @cowprotocol/sdk-app-data bumped to 4.6.2
    * @cowprotocol/sdk-order-book bumped to 0.6.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.30
    * @cowprotocol/sdk-contracts-ts bumped to 1.4.2
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.5
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.5
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.5

## [0.9.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.9.2...sdk-trading-v0.9.3) (2026-02-02)


### 🐛 Bug Fixes

* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.3
    * @cowprotocol/sdk-config bumped to 0.7.2
    * @cowprotocol/sdk-app-data bumped to 4.6.1
    * @cowprotocol/sdk-order-book bumped to 0.6.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.29
    * @cowprotocol/sdk-contracts-ts bumped to 1.4.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.4
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.4
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.4

## [0.9.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.9.1...sdk-trading-v0.9.2) (2026-01-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.2
    * @cowprotocol/sdk-config bumped to 0.7.1
    * @cowprotocol/sdk-app-data bumped to 4.6.0
    * @cowprotocol/sdk-order-book bumped to 0.6.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.28
    * @cowprotocol/sdk-contracts-ts bumped to 1.4.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.3

## [0.9.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.9.0...sdk-trading-v0.9.1) (2026-01-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.1
    * @cowprotocol/sdk-config bumped to 0.7.0
    * @cowprotocol/sdk-app-data bumped to 4.5.2
    * @cowprotocol/sdk-order-book bumped to 0.6.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.27
    * @cowprotocol/sdk-contracts-ts bumped to 1.3.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.2

## [0.9.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.8.2...sdk-trading-v0.9.0) (2026-01-22)


### ✨ Features

* **bridge:** add a flag to control intermediate=sell token ([#777](https://github.com/cowprotocol/cow-sdk/issues/777)) ([588dffa](https://github.com/cowprotocol/cow-sdk/commit/588dffaf418b8220293fe803186e3801597282d0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.26
    * @cowprotocol/sdk-contracts-ts bumped to 1.2.0

## [0.8.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.8.1...sdk-trading-v0.8.2) (2026-01-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.25
    * @cowprotocol/sdk-contracts-ts bumped to 1.1.1

## [0.8.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.8.0...sdk-trading-v0.8.1) (2026-01-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.0
    * @cowprotocol/sdk-config bumped to 0.6.3
    * @cowprotocol/sdk-app-data bumped to 4.5.1
    * @cowprotocol/sdk-order-book bumped to 0.5.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.24
    * @cowprotocol/sdk-contracts-ts bumped to 1.1.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.1

## [0.8.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.7.4...sdk-trading-v0.8.0) (2025-12-25)


### ✨ Features

* **app-data:** add user terms consents ([#763](https://github.com/cowprotocol/cow-sdk/issues/763)) ([1fc0b26](https://github.com/cowprotocol/cow-sdk/commit/1fc0b26ba250505db19c9189dd52a5e021c9616e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.5.0

## [0.7.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.7.3...sdk-trading-v0.7.4) (2025-12-24)


### 🐛 Bug Fixes

* change applyCostsSlippageAndFees default for limit orders ([#760](https://github.com/cowprotocol/cow-sdk/issues/760)) ([d10c17b](https://github.com/cowprotocol/cow-sdk/commit/d10c17b10097616a4e042b04a862bc6cb3b1b0af))

## [0.7.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.7.2...sdk-trading-v0.7.3) (2025-12-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.4.0
    * @cowprotocol/sdk-order-book bumped to 0.5.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.23

## [0.7.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.7.1...sdk-trading-v0.7.2) (2025-12-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.22
    * @cowprotocol/sdk-contracts-ts bumped to 1.0.0

## [0.7.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.7.0...sdk-trading-v0.7.1) (2025-12-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.6.2
    * @cowprotocol/sdk-app-data bumped to 4.3.6
    * @cowprotocol/sdk-order-book bumped to 0.4.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.21
    * @cowprotocol/sdk-contracts-ts bumped to 0.8.1

## [0.7.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.6.3...sdk-trading-v0.7.0) (2025-12-10)


### ✨ Features

* **bridge:** determine intermediate token ([#738](https://github.com/cowprotocol/cow-sdk/issues/738)) ([381e885](https://github.com/cowprotocol/cow-sdk/commit/381e885d398623cfd731b439e7e62e8b863736c8))


### 🔧 Miscellaneous

* release main ([#741](https://github.com/cowprotocol/cow-sdk/issues/741)) ([32fb8bb](https://github.com/cowprotocol/cow-sdk/commit/32fb8bbe6b1172c2666f330d0d50cdc2f7c2554f))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.20
    * @cowprotocol/sdk-contracts-ts bumped to 0.8.0

## [0.6.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.6.2...sdk-trading-v0.6.3) (2025-12-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.6.1
    * @cowprotocol/sdk-app-data bumped to 4.3.5
    * @cowprotocol/sdk-order-book bumped to 0.4.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.19
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.4

## [0.6.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.6.1...sdk-trading-v0.6.2) (2025-12-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.6.0
    * @cowprotocol/sdk-app-data bumped to 4.3.4
    * @cowprotocol/sdk-order-book bumped to 0.4.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.18
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.3

## [0.6.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.6.0...sdk-trading-v0.6.1) (2025-12-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.5.0
    * @cowprotocol/sdk-app-data bumped to 4.3.3
    * @cowprotocol/sdk-order-book bumped to 0.4.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.17
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.2

## [0.6.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.5.4...sdk-trading-v0.6.0) (2025-12-03)


### ✨ Features

* **app-data:** add UTM Tracking for Developer Attribution ([#722](https://github.com/cowprotocol/cow-sdk/issues/722)) ([0cd79d1](https://github.com/cowprotocol/cow-sdk/commit/0cd79d185630cc44b111979e873e30c760904976))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.2

## [0.5.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.5.3...sdk-trading-v0.5.4) (2025-12-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 0.4.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.16

## [0.5.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.5.2...sdk-trading-v0.5.3) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 0.3.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.15

## [0.5.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.5.1...sdk-trading-v0.5.2) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.4.1
    * @cowprotocol/sdk-app-data bumped to 4.3.1
    * @cowprotocol/sdk-order-book bumped to 0.3.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.14
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.1

## [0.5.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.5.0...sdk-trading-v0.5.1) (2025-11-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.13
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.0

## [0.5.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.4.6...sdk-trading-v0.5.0) (2025-11-24)


### ✨ Features

* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))
* implement protocol fee ([#689](https://github.com/cowprotocol/cow-sdk/issues/689)) ([ec5bdad](https://github.com/cowprotocol/cow-sdk/commit/ec5bdada1ebf17afd42a9c8cabd617cf8be79d50))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.4.0
    * @cowprotocol/sdk-config bumped to 0.4.0
    * @cowprotocol/sdk-app-data bumped to 4.2.0
    * @cowprotocol/sdk-order-book bumped to 0.3.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.12
    * @cowprotocol/sdk-contracts-ts bumped to 0.6.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0

## [0.4.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.4.5...sdk-trading-v0.4.6) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.11
    * @cowprotocol/sdk-contracts-ts bumped to 0.5.0

## [0.4.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.4.4...sdk-trading-v0.4.5) (2025-11-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.0
    * @cowprotocol/sdk-app-data bumped to 4.1.6
    * @cowprotocol/sdk-order-book bumped to 0.2.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.10
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.4

## [0.4.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.4.3...sdk-trading-v0.4.4) (2025-10-30)


### 🐛 Bug Fixes

* flashloan fee calculation now matches aave's ([#622](https://github.com/cowprotocol/cow-sdk/issues/622)) ([8d11b7f](https://github.com/cowprotocol/cow-sdk/commit/8d11b7fbbc8ff797253f26772a0e5c940286f2d9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.9
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.3

## [0.4.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.4.2...sdk-trading-v0.4.3) (2025-10-29)


### 🔧 Miscellaneous

* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0
    * @cowprotocol/sdk-app-data bumped to 4.1.5
    * @cowprotocol/sdk-order-book bumped to 0.1.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.8
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.2
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.0

## [0.4.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.4.1...sdk-trading-v0.4.2) (2025-10-24)


### 🐛 Bug Fixes

* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.2
    * @cowprotocol/sdk-config bumped to 0.2.0
    * @cowprotocol/sdk-app-data bumped to 4.1.4
    * @cowprotocol/sdk-order-book bumped to 0.1.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.7
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.3

## [0.4.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.4.0...sdk-trading-v0.4.1) (2025-10-17)


### 🔧 Miscellaneous

* release main ([#592](https://github.com/cowprotocol/cow-sdk/issues/592)) ([e4d7212](https://github.com/cowprotocol/cow-sdk/commit/e4d7212af322beced743e985bd1fbedaef66cdcb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.3

## [0.4.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.3.2...sdk-trading-v0.4.0) (2025-10-15)


### ✨ Features

* **trading:** add validTo parameter to getQuote ([#576](https://github.com/cowprotocol/cow-sdk/issues/576)) ([fcf4258](https://github.com/cowprotocol/cow-sdk/commit/fcf425806044c0ea8b83cfb4116d2f7fb9fcc6e0))


### 📚 Documentation

* add link to cancel order doc ([#580](https://github.com/cowprotocol/cow-sdk/issues/580)) ([9764178](https://github.com/cowprotocol/cow-sdk/commit/97641785500141c7e68a96483f17a624724b5386))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.6
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.0

## [0.3.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.3.1...sdk-trading-v0.3.2) (2025-10-08)


### 🐛 Bug Fixes

* **slippage:** use volatility slippage to calculate volume slippage ([#574](https://github.com/cowprotocol/cow-sdk/issues/574)) ([0d86551](https://github.com/cowprotocol/cow-sdk/commit/0d8655153199707bed13b8303dac4a7c5d50a57a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.1
    * @cowprotocol/sdk-app-data bumped to 4.1.1
    * @cowprotocol/sdk-order-book bumped to 0.1.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.5
    * @cowprotocol/sdk-contracts-ts bumped to 0.3.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.2

## [0.3.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.3.0...sdk-trading-v0.3.1) (2025-10-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.0

## [0.3.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.2.1...sdk-trading-v0.3.0) (2025-10-07)


### ✨ Features

* **trading:** add methods to approve and check allowance ([#570](https://github.com/cowprotocol/cow-sdk/issues/570)) ([fc44e8b](https://github.com/cowprotocol/cow-sdk/commit/fc44e8bf602634194bed672ca20dcc4a8ff07446))
* **trading:** add methods to cancel order ([#569](https://github.com/cowprotocol/cow-sdk/issues/569)) ([4735d47](https://github.com/cowprotocol/cow-sdk/commit/4735d47575ce1092f4213e579f752c3ac4ed9f7b))

## [0.2.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.2.0...sdk-trading-v0.2.1) (2025-10-07)


### 🐛 Bug Fixes

* **slippage:** reduce lower cap from 0.5 to 0% ([#565](https://github.com/cowprotocol/cow-sdk/issues/565)) ([302fb72](https://github.com/cowprotocol/cow-sdk/commit/302fb72d1fca80edb7acdf83a6987991a7e487e3))

## [0.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.1.3...sdk-trading-v0.2.0) (2025-10-06)


### ✨ Features

* **trading:** use suggested slippage from BFF ([#546](https://github.com/cowprotocol/cow-sdk/issues/546)) ([b6a59c7](https://github.com/cowprotocol/cow-sdk/commit/b6a59c780fbfb0f2e840276fe905b2efd810805c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.0
    * @cowprotocol/sdk-app-data bumped to 4.0.1
    * @cowprotocol/sdk-order-book bumped to 0.1.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.4
    * @cowprotocol/sdk-contracts-ts bumped to 0.3.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.1

## [0.1.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.1.2...sdk-trading-v0.1.3) (2025-09-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.3
    * @cowprotocol/sdk-contracts-ts bumped to 0.2.1

## [0.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.1.1...sdk-trading-v0.1.2) (2025-09-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.2
    * @cowprotocol/sdk-contracts-ts bumped to 0.2.0

## [0.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.1.0...sdk-trading-v0.1.1) (2025-09-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.1
    * @cowprotocol/sdk-contracts-ts bumped to 0.1.1

## [0.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.3.2-beta.0...sdk-trading-v0.1.0) (2025-09-17)


### ⚠ BREAKING CHANGES

* release cow-sdk v7

### ✨ Features

* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.1.0
    * @cowprotocol/sdk-config bumped to 0.1.0
    * @cowprotocol/sdk-app-data bumped to 4.0.0
    * @cowprotocol/sdk-order-book bumped to 0.1.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.1.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.0

## [0.3.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.3.1-beta.0...sdk-trading-v0.3.2-beta.0) (2025-09-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.0-beta.0
    * @cowprotocol/sdk-app-data bumped to 4.1.7-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.3.1-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.8-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.3.0-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.1-beta.0

## [0.3.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.3.0-beta.0...sdk-trading-v0.3.1-beta.0) (2025-09-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.6-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.7-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.2.1-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.4-beta.0

## [0.3.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.2.6-beta.0...sdk-trading-v0.3.0-beta.0) (2025-09-16)


### ✨ Features

* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))


### 📚 Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.4.0-beta.0
    * @cowprotocol/sdk-config bumped to 0.3.3-beta.0
    * @cowprotocol/sdk-app-data bumped to 4.1.5-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.6-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.2.0-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0-beta.0

## [0.2.6-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.2.5-beta.0...sdk-trading-v0.2.6-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.2-beta.0
    * @cowprotocol/sdk-app-data bumped to 4.1.4-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.5-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.7-beta.0

## [0.2.5-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.2.4-beta.0...sdk-trading-v0.2.5-beta.0) (2025-09-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.1-beta.0
    * @cowprotocol/sdk-app-data bumped to 4.1.3-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.4-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.6-beta.0

## [0.2.4-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.2.3-beta.0...sdk-trading-v0.2.4-beta.0) (2025-09-15)


### 🐛 Bug Fixes

* **bridge:** fix applying affiliate header ([#492](https://github.com/cowprotocol/cow-sdk/issues/492)) ([e4f49c6](https://github.com/cowprotocol/cow-sdk/commit/e4f49c64e60f4aeac97b6b246c36090946df6fcf))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-signing bumped to 0.2.3-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.5-beta.0

## [0.2.3-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.2.2-beta.0...sdk-trading-v0.2.3-beta.0) (2025-09-11)


### 🔧 Miscellaneous

* release main ([#488](https://github.com/cowprotocol/cow-sdk/issues/488)) ([6344fa6](https://github.com/cowprotocol/cow-sdk/commit/6344fa619465e6f94637677823a18646f06fa7c9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-app-data bumped to 4.1.2-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.4-beta.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.2-beta.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.2-beta.0

## [0.2.2-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.2.1-beta.0...sdk-trading-v0.2.2-beta.0) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 0.3.0-beta.0
    * @cowprotocol/sdk-app-data bumped to 4.1.1-beta.0
    * @cowprotocol/sdk-order-book bumped to 0.2.1-beta.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.1-beta.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.3-beta.0

## [0.2.1-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.2.0-beta.0...sdk-trading-v0.2.1-beta.0) (2025-09-01)


### 🐛 Bug Fixes

* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))

## [0.2.0-beta.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v0.1.0-beta.0...sdk-trading-v0.2.0-beta.0) (2025-08-28)


### ✨ Features

* add a basic example of tradingSDK with Ethers5 ([#437](https://github.com/cowprotocol/cow-sdk/issues/437)) ([61e11a1](https://github.com/cowprotocol/cow-sdk/commit/61e11a11c8650e6a29fe8c9d9a795e3aff02030a))
* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### 🐛 Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))


### 🔧 Miscellaneous

* fix main merge ([c1aa2b8](https://github.com/cowprotocol/cow-sdk/commit/c1aa2b81bd4e1b008b87a4207c8cf3358056ab1b))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
