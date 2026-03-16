:robot: I have created a release *beep* *boop*
---


<details><summary>cow-sdk: 9.0.0</summary>

## [9.0.0](https://github.com/cowprotocol/cow-sdk/compare/cow-sdk-v8.0.1...cow-sdk-v9.0.0) (2026-03-16)


###   BREAKING CHANGES

* **chains:** Remove support for Lens.
* release cow-sdk v7

### ( Features

* add API endpoints for partners ([#809](https://github.com/cowprotocol/cow-sdk/issues/809)) ([59900e8](https://github.com/cowprotocol/cow-sdk/commit/59900e854a336e294ec881bd70bb13e579ff48ec))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* **app-data:** add UTM Tracking for Developer Attribution ([#722](https://github.com/cowprotocol/cow-sdk/issues/722)) ([0cd79d1](https://github.com/cowprotocol/cow-sdk/commit/0cd79d185630cc44b111979e873e30c760904976))
* **chains:** Remove Lens ([#818](https://github.com/cowprotocol/cow-sdk/issues/818)) ([e8c74a0](https://github.com/cowprotocol/cow-sdk/commit/e8c74a078e5940901591652164af7b2ffb7b1fa6))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))
* **lib-agnostic:** add nodejs examples for every adapter ([#440](https://github.com/cowprotocol/cow-sdk/issues/440)) ([43972e6](https://github.com/cowprotocol/cow-sdk/commit/43972e68ff728a9a882bbdc667b2c0821b273449))
* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* simplify OrderSigningUtils to use static methods only ([#417](https://github.com/cowprotocol/cow-sdk/issues/417)) ([899ca43](https://github.com/cowprotocol/cow-sdk/commit/899ca4325be831b6711468d1df3733d98fe913b0))


### = Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))


### =Ú Documentation

* update Low-Level SDK Usage Example ([#766](https://github.com/cowprotocol/cow-sdk/issues/766)) ([0b6949c](https://github.com/cowprotocol/cow-sdk/commit/0b6949cff628d390c17db8661cd917e486c75af3))
* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

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
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* remove `under development` comment from Linea and Plasma ([#770](https://github.com/cowprotocol/cow-sdk/issues/770)) ([cbb5361](https://github.com/cowprotocol/cow-sdk/commit/cbb53611674553e40d42ffcb3d0f599f49ec2fa1))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 5.0.0
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 3.0.0
    * @cowprotocol/sdk-order-book bumped to 3.0.0
    * @cowprotocol/sdk-order-signing bumped to 1.0.0
    * @cowprotocol/sdk-trading bumped to 2.0.0
</details>

<details><summary>sdk-app-data: 5.0.0</summary>

## [5.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.9...sdk-app-data-v5.0.0) (2026-03-16)


###   BREAKING CHANGES

* release cow-sdk v7

### ( Features

* allow new code property in referrer schema ([#774](https://github.com/cowprotocol/cow-sdk/issues/774)) ([2b648b6](https://github.com/cowprotocol/cow-sdk/commit/2b648b6a1db03fd34002c49572d8e8e556d03593))
* **app-data:** add `wrappers` to app-data ([#746](https://github.com/cowprotocol/cow-sdk/issues/746)) ([6d1868a](https://github.com/cowprotocol/cow-sdk/commit/6d1868a7430a33caa46caa7bf41465e42ecd5a8f))
* **app-data:** add user terms consents ([#763](https://github.com/cowprotocol/cow-sdk/issues/763)) ([1fc0b26](https://github.com/cowprotocol/cow-sdk/commit/1fc0b26ba250505db19c9189dd52a5e021c9616e))
* **app-data:** update flashloan schema to 0.2.0 ([#572](https://github.com/cowprotocol/cow-sdk/issues/572)) ([e909dbd](https://github.com/cowprotocol/cow-sdk/commit/e909dbd059077fa80c52c9651b4ae2b6f6edd97c))
* **bridge:** add quote id and signature metadata ([#701](https://github.com/cowprotocol/cow-sdk/issues/701)) ([35a25a7](https://github.com/cowprotocol/cow-sdk/commit/35a25a7fcc2724073355b3dba4b8f6d3b7419032))
* **bridge:** extend bridging appData with attestation data ([#756](https://github.com/cowprotocol/cow-sdk/issues/756)) ([ff04417](https://github.com/cowprotocol/cow-sdk/commit/ff044172bdfa2997393e2bf9a331119815d2fc12))
* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))
* copy entire src, tests folders, and package/tsconfig files from app-data project into the monorepo ([70ef622](https://github.com/cowprotocol/cow-sdk/commit/70ef622eac14cb38837144ab15418eff27d8cba7))
* implement adapter usage in app-data; update app-data config and test files ([422afd2](https://github.com/cowprotocol/cow-sdk/commit/422afd2e7613d6f7558764f149b15aae4be65390))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create app data package ([#327](https://github.com/cowprotocol/cow-sdk/issues/327)) ([8b61261](https://github.com/cowprotocol/cow-sdk/commit/8b612615bc280dee2e5f4767794bc03f590d4764))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### = Bug Fixes

* **app-data:** fix typos and ids in schemas ([#586](https://github.com/cowprotocol/cow-sdk/issues/586)) ([5a4461a](https://github.com/cowprotocol/cow-sdk/commit/5a4461a2a171689db04f7c805c9e2c835bbd36dd))
* **app-data:** remove dappId validation ([#591](https://github.com/cowprotocol/cow-sdk/issues/591)) ([9db80c3](https://github.com/cowprotocol/cow-sdk/commit/9db80c34923c6b12ed9ecb3ed26ca1a99acd2b8f))
* **app-data:** rename `is_omittable` property as camelCase in appData ([6b16d0d](https://github.com/cowprotocol/cow-sdk/commit/6b16d0dab7831035651529169c572df79e79640d))
* **app-data:** rename `is_omittable` property in wrappers app data ([bb5c637](https://github.com/cowprotocol/cow-sdk/commit/bb5c6375135937389974916267fee850666fa2dd))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))


### =Ú Documentation

* **app-data:** updated readme ([#725](https://github.com/cowprotocol/cow-sdk/issues/725)) ([c86fb55](https://github.com/cowprotocol/cow-sdk/commit/c86fb55f0a97b50da935da24e1f57796b86b4325))
* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

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
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#702](https://github.com/cowprotocol/cow-sdk/issues/702)) ([1e6b54d](https://github.com/cowprotocol/cow-sdk/commit/1e6b54dbaef21a61c362bc2d1567d87f14d7f8a7))
* release main ([#718](https://github.com/cowprotocol/cow-sdk/issues/718)) ([87683ec](https://github.com/cowprotocol/cow-sdk/commit/87683ecc507e59d70a6d623faba83cda65ca44cc))
* release main ([#726](https://github.com/cowprotocol/cow-sdk/issues/726)) ([a6a51e6](https://github.com/cowprotocol/cow-sdk/commit/a6a51e6ec3edd9fdb6c1384070ad24a5cac3cb98))
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#754](https://github.com/cowprotocol/cow-sdk/issues/754)) ([3f2f53c](https://github.com/cowprotocol/cow-sdk/commit/3f2f53cdf66520d2f2c8fd82df2b614bc202eb6b))
* release main ([#764](https://github.com/cowprotocol/cow-sdk/issues/764)) ([eb71e9d](https://github.com/cowprotocol/cow-sdk/commit/eb71e9dba6efedb1eff3c5039f1b07bd0554418b))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0
</details>

<details><summary>sdk-bridging: 4.0.0</summary>

## [4.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.1.0...sdk-bridging-v4.0.0) (2026-03-16)


###   BREAKING CHANGES

* **chains:** Remove support for Lens.
* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800))
* **bridge:** split swap and bridge slippages ([#750](https://github.com/cowprotocol/cow-sdk/issues/750))
* release cow-sdk v7

### ( Features

* add caching to SDK Bridging ([#521](https://github.com/cowprotocol/cow-sdk/issues/521)) ([0c44212](https://github.com/cowprotocol/cow-sdk/commit/0c442121af74c297a002c7c0f608fb3396b9a446))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* add new SELL_AMOUNT_TOO_SMALL error and catch it in near provider ([#743](https://github.com/cowprotocol/cow-sdk/issues/743)) ([4e6c896](https://github.com/cowprotocol/cow-sdk/commit/4e6c8961d318cf4b45f145121eaf65ec30e91de0))
* Add non-evm chains types & guards & address validators  ([#792](https://github.com/cowprotocol/cow-sdk/issues/792)) ([b4b6047](https://github.com/cowprotocol/cow-sdk/commit/b4b6047889190f668f6409aeee7079ba6095f9ae))
* add plasma support for Near bridge provider ([#769](https://github.com/cowprotocol/cow-sdk/issues/769)) ([a3db993](https://github.com/cowprotocol/cow-sdk/commit/a3db993e9fedb54b87d7a2048c163c5fdaec7272))
* allow Bungee API custom base url and api key ([#517](https://github.com/cowprotocol/cow-sdk/issues/517)) ([a5cda81](https://github.com/cowprotocol/cow-sdk/commit/a5cda813d9f58a9e16393ab4eb1e350296fef2f8))
* allow new code property in referrer schema ([#774](https://github.com/cowprotocol/cow-sdk/issues/774)) ([2b648b6](https://github.com/cowprotocol/cow-sdk/commit/2b648b6a1db03fd34002c49572d8e8e556d03593))
* allow other bridge provider families in CoW Swap: Recipient based ([#552](https://github.com/cowprotocol/cow-sdk/issues/552)) ([ae56511](https://github.com/cowprotocol/cow-sdk/commit/ae565112dd1fe107d7b297eddf529e07f06529fb))
* autopublish to npm registry in GH ([#539](https://github.com/cowprotocol/cow-sdk/issues/539)) ([9e4a755](https://github.com/cowprotocol/cow-sdk/commit/9e4a7551b5e0a32a7a9e4ca3781ec088e16e25af))
* **bridge:** add a flag to control intermediate=sell token ([#777](https://github.com/cowprotocol/cow-sdk/issues/777)) ([588dffa](https://github.com/cowprotocol/cow-sdk/commit/588dffaf418b8220293fe803186e3801597282d0))
* **bridge:** add Bungee affiliate field ([aa32cc9](https://github.com/cowprotocol/cow-sdk/commit/aa32cc9bfdd8c0b3dd6d15e8485f2c089feec11b))
* **bridge:** add method to get best result from multiple providers ([#527](https://github.com/cowprotocol/cow-sdk/issues/527)) ([afd0005](https://github.com/cowprotocol/cow-sdk/commit/afd00053df4cbc4fdf9dcaa57ff0285d4e2af643))
* **bridge:** add NearIntents bridge provider ([#663](https://github.com/cowprotocol/cow-sdk/issues/663)) ([afd63bc](https://github.com/cowprotocol/cow-sdk/commit/afd63bce3765e2adc81b73357e233399111e3595))
* **bridge:** add quote id and signature metadata ([#701](https://github.com/cowprotocol/cow-sdk/issues/701)) ([35a25a7](https://github.com/cowprotocol/cow-sdk/commit/35a25a7fcc2724073355b3dba4b8f6d3b7419032))
* **bridge:** allow sell token as intermediate token ([#768](https://github.com/cowprotocol/cow-sdk/issues/768)) ([8c367ac](https://github.com/cowprotocol/cow-sdk/commit/8c367ac704ad10003618c8916e32529c5c9eb815))
* **bridge:** decompose BridgingSdk logic into strategies ([#528](https://github.com/cowprotocol/cow-sdk/issues/528)) ([be1a0f3](https://github.com/cowprotocol/cow-sdk/commit/be1a0f3d4995e6ac3ae929dd2b1aab3a6cbfd6c5))
* **bridge:** determine intermediate token ([#738](https://github.com/cowprotocol/cow-sdk/issues/738)) ([381e885](https://github.com/cowprotocol/cow-sdk/commit/381e885d398623cfd731b439e7e62e8b863736c8))
* **bridge:** extend bridging appData with attestation data ([#756](https://github.com/cowprotocol/cow-sdk/issues/756)) ([ff04417](https://github.com/cowprotocol/cow-sdk/commit/ff044172bdfa2997393e2bf9a331119815d2fc12))
* **bridge:** fallback to public endpoints in BungeeApi ([#529](https://github.com/cowprotocol/cow-sdk/issues/529)) ([b857aa7](https://github.com/cowprotocol/cow-sdk/commit/b857aa7cb8ee7a323e59922684549bdb734e374c))
* **bridge:** make multi-quote method progressive ([#526](https://github.com/cowprotocol/cow-sdk/issues/526)) ([27536c6](https://github.com/cowprotocol/cow-sdk/commit/27536c63ec91a26323ffb341c1edbef0ab9331a3))
* **bridge:** split swap and bridge slippages ([#750](https://github.com/cowprotocol/cow-sdk/issues/750)) ([3ae7b57](https://github.com/cowprotocol/cow-sdk/commit/3ae7b574d1215ae598ec0a519ec003a9f21b7a7f))
* **bridge:** support multi provider quote requests ([#518](https://github.com/cowprotocol/cow-sdk/issues/518)) ([36ed8f9](https://github.com/cowprotocol/cow-sdk/commit/36ed8f999d0b532b1a6e9c50c3152e3242dd333e))
* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))
* **chains:** Remove Lens ([#818](https://github.com/cowprotocol/cow-sdk/issues/818)) ([e8c74a0](https://github.com/cowprotocol/cow-sdk/commit/e8c74a078e5940901591652164af7b2ffb7b1fa6))
* implement protocol fee ([#689](https://github.com/cowprotocol/cow-sdk/issues/689)) ([ec5bdad](https://github.com/cowprotocol/cow-sdk/commit/ec5bdada1ebf17afd42a9c8cabd617cf8be79d50))
* improve order priority ([#745](https://github.com/cowprotocol/cow-sdk/issues/745)) ([1de00ba](https://github.com/cowprotocol/cow-sdk/commit/1de00ba5007d4e8ef78be73e7b47e99ece105ef0))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* update settlement and vault relayer contracts on staging ([#807](https://github.com/cowprotocol/cow-sdk/issues/807)) ([0f9a03e](https://github.com/cowprotocol/cow-sdk/commit/0f9a03e6bfa3468630e46735f7583618ae711b73))
* use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([1b23c5e](https://github.com/cowprotocol/cow-sdk/commit/1b23c5e5f7e1763b710b95f444ad052395808277))
* use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([2a8e220](https://github.com/cowprotocol/cow-sdk/commit/2a8e2205acc5143efecbc9caee89d01f32570e0d))


### = Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* add optional apiKey for NearIntentsBridgeProvider ([#775](https://github.com/cowprotocol/cow-sdk/issues/775)) ([7546a4c](https://github.com/cowprotocol/cow-sdk/commit/7546a4c75fe43b5ee8381a45eb6608d5e8593436))
* **bridge:** capture surplus in Near intents ([#714](https://github.com/cowprotocol/cow-sdk/issues/714)) ([b74ebc8](https://github.com/cowprotocol/cow-sdk/commit/b74ebc8a0c730f9254f81b3cff64695894ed193e))
* **bridge:** filter providers when do MultiQuote ([#753](https://github.com/cowprotocol/cow-sdk/issues/753)) ([aa4aa96](https://github.com/cowprotocol/cow-sdk/commit/aa4aa961914436595ceb901602d5da09f1f54ae9))
* **bridge:** fix Across tx explorer link ([#537](https://github.com/cowprotocol/cow-sdk/issues/537)) ([d76db02](https://github.com/cowprotocol/cow-sdk/commit/d76db02a53cebe6a18032293729d590affa0c38c))
* **bridge:** fix applying affiliate header ([#492](https://github.com/cowprotocol/cow-sdk/issues/492)) ([e4f49c6](https://github.com/cowprotocol/cow-sdk/commit/e4f49c64e60f4aeac97b6b246c36090946df6fcf))
* **bridge:** increase extra gas for post hook ([#815](https://github.com/cowprotocol/cow-sdk/issues/815)) ([4e2330f](https://github.com/cowprotocol/cow-sdk/commit/4e2330f5af0613081b2be9a9c7c6ff0e93035f46))
* **bridge:** increase gas for Gnosis bridge hook ([71b987d](https://github.com/cowprotocol/cow-sdk/commit/71b987d3a53d59aa0dad1fbdaaab36b0c77c72a7))
* **bridge:** multi-quote strategies should not swallow BridgeProviderQuoteError ([#533](https://github.com/cowprotocol/cow-sdk/issues/533)) ([7789699](https://github.com/cowprotocol/cow-sdk/commit/77896999aa2140b70cd2919ede279eb7ebcf0b7b))
* **bridge:** relax multi-quote errors wrapping ([#535](https://github.com/cowprotocol/cow-sdk/issues/535)) ([551f3d8](https://github.com/cowprotocol/cow-sdk/commit/551f3d899b125838101b7ba4214b37c2ceaf36ea))
* **bridge:** update bungee smart-contract address ([#506](https://github.com/cowprotocol/cow-sdk/issues/506)) ([f8e736a](https://github.com/cowprotocol/cow-sdk/commit/f8e736aafb6c3ca2c2020282e0f1af7ce6c0b5ac))
* **bridge:** use swapSlippageBps for non-bridge swaps ([#757](https://github.com/cowprotocol/cow-sdk/issues/757)) ([5f86ea5](https://github.com/cowprotocol/cow-sdk/commit/5f86ea59904922e164b2ee97f64e1b1148f9a92e))
* bungee across bridge config ([#748](https://github.com/cowprotocol/cow-sdk/issues/748)) ([6219b05](https://github.com/cowprotocol/cow-sdk/commit/6219b05ebda268e71ce68fd06146545ff0a4f25c))
* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))
* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800)) ([ea96f67](https://github.com/cowprotocol/cow-sdk/commit/ea96f67a6ff44b7cc9226dc8ab7991896ced3ca7))


### =Ú Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### >ê Tests

* fix MultiQuoteStrategy flacky tests ([#540](https://github.com/cowprotocol/cow-sdk/issues/540)) ([aa0f90c](https://github.com/cowprotocol/cow-sdk/commit/aa0f90c04b2eaf6da08698e487dcdc62cb7ad8c1))


### =' Miscellaneous

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
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#637](https://github.com/cowprotocol/cow-sdk/issues/637)) ([6909e8d](https://github.com/cowprotocol/cow-sdk/commit/6909e8d5e97afadc203be2293865bfb2f9338953))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#650](https://github.com/cowprotocol/cow-sdk/issues/650)) ([2493612](https://github.com/cowprotocol/cow-sdk/commit/24936120e51b0083eda408ab80b8f8ee4115e223))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#702](https://github.com/cowprotocol/cow-sdk/issues/702)) ([1e6b54d](https://github.com/cowprotocol/cow-sdk/commit/1e6b54dbaef21a61c362bc2d1567d87f14d7f8a7))
* release main ([#715](https://github.com/cowprotocol/cow-sdk/issues/715)) ([00db701](https://github.com/cowprotocol/cow-sdk/commit/00db7017c13be1e13f56fe010f180611939e575d))
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
* release main ([#749](https://github.com/cowprotocol/cow-sdk/issues/749)) ([5fe0a6b](https://github.com/cowprotocol/cow-sdk/commit/5fe0a6b4cbc45b87c58af77a9c941b31b8dd4757))
* release main ([#751](https://github.com/cowprotocol/cow-sdk/issues/751)) ([885d7f7](https://github.com/cowprotocol/cow-sdk/commit/885d7f707bf2074dfb80df6ebcf41c12515695e3))
* release main ([#754](https://github.com/cowprotocol/cow-sdk/issues/754)) ([3f2f53c](https://github.com/cowprotocol/cow-sdk/commit/3f2f53cdf66520d2f2c8fd82df2b614bc202eb6b))
* release main ([#758](https://github.com/cowprotocol/cow-sdk/issues/758)) ([8681a8e](https://github.com/cowprotocol/cow-sdk/commit/8681a8e357be94b1a355598fcfcb447900a284f1))
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
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* revert use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([f73bc96](https://github.com/cowprotocol/cow-sdk/commit/f73bc96156796ce4928f64f963295501dfc69a5c))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* test solve issue dependencies ([#548](https://github.com/cowprotocol/cow-sdk/issues/548)) ([451b049](https://github.com/cowprotocol/cow-sdk/commit/451b04974889398a2ef5dfae079ef58011bff1f6))
* use a better name for main packages ([#543](https://github.com/cowprotocol/cow-sdk/issues/543)) ([3c57f55](https://github.com/cowprotocol/cow-sdk/commit/3c57f553a88209b982959db15dba8740b7a5bb80))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 5.0.0
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 3.0.0
    * @cowprotocol/sdk-cow-shed bumped to 1.0.0
    * @cowprotocol/sdk-order-book bumped to 3.0.0
    * @cowprotocol/sdk-trading bumped to 2.0.0
    * @cowprotocol/sdk-weiroll bumped to 1.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-order-signing bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0
</details>

<details><summary>sdk-common: 1.0.0</summary>

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-common-v0.8.0...sdk-common-v1.0.0) (2026-03-16)


###   BREAKING CHANGES

* release cow-sdk v7 ([#514](https://github.com/cowprotocol/cow-sdk/issues/514))

### ( Features

* add caching to SDK Bridging ([#521](https://github.com/cowprotocol/cow-sdk/issues/521)) ([0c44212](https://github.com/cowprotocol/cow-sdk/commit/0c442121af74c297a002c7c0f608fb3396b9a446))
* add from/to fields for receipt ([#629](https://github.com/cowprotocol/cow-sdk/issues/629)) ([3dd3868](https://github.com/cowprotocol/cow-sdk/commit/3dd38682741ac93bfbd9b7d9a4fe79df7283dca0))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* Add non-evm chains types & guards & address validators  ([#792](https://github.com/cowprotocol/cow-sdk/issues/792)) ([b4b6047](https://github.com/cowprotocol/cow-sdk/commit/b4b6047889190f668f6409aeee7079ba6095f9ae))
* **bridge:** add NearIntents bridge provider ([#663](https://github.com/cowprotocol/cow-sdk/issues/663)) ([afd63bc](https://github.com/cowprotocol/cow-sdk/commit/afd63bce3765e2adc81b73357e233399111e3595))
* **bridge:** allow sell token as intermediate token ([#768](https://github.com/cowprotocol/cow-sdk/issues/768)) ([8c367ac](https://github.com/cowprotocol/cow-sdk/commit/8c367ac704ad10003618c8916e32529c5c9eb815))
* **cow-shed:** add estimateGas method to SignerAdapters ([fbb626a](https://github.com/cowprotocol/cow-sdk/commit/fbb626a0f88f6cb206432b4233b2d7d1e7cd4ad4))
* **cow-shed:** refact on common and contract-ts ([4be05aa](https://github.com/cowprotocol/cow-sdk/commit/4be05aa7a376fbc7d2ed5b2d2b6b68e3630b9c59))
* **cow-shed:** validate EIP1271 signature ([#508](https://github.com/cowprotocol/cow-sdk/issues/508)) ([5c72123](https://github.com/cowprotocol/cow-sdk/commit/5c7212323edcea3eadf70973f765619afb1bcaf4))
* create common package with abstract adapter and context classes ([5e99f36](https://github.com/cowprotocol/cow-sdk/commit/5e99f36ddf1d8380a6ed136a51a7a1ecc4870396))
* enhance composable to test the 3 adapters ([7d1bd77](https://github.com/cowprotocol/cow-sdk/commit/7d1bd776b40a10808b9f6392dda862f610131169))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* move address utils ([#795](https://github.com/cowprotocol/cow-sdk/issues/795)) ([d18212c](https://github.com/cowprotocol/cow-sdk/commit/d18212c868ca2c16525a530f7914c9440f147414))
* refactor composable module to be framework-agnostic ([55032a2](https://github.com/cowprotocol/cow-sdk/commit/55032a2ca11d38d343f5f2c07c96b422671fa9e6))
* refactor contracts-ts ([2e14272](https://github.com/cowprotocol/cow-sdk/commit/2e14272f1a24a232aef584611924055ed657d16c))
* refactor contracts-ts ([b441360](https://github.com/cowprotocol/cow-sdk/commit/b4413600d4a0753e9f608e6a6415e64762a53d3e))
* refactor order-signing ([8e28d1b](https://github.com/cowprotocol/cow-sdk/commit/8e28d1bdbda9632347cacaae906298e736f4a7b3))
* release cow-sdk v7 ([#514](https://github.com/cowprotocol/cow-sdk/issues/514)) ([01ebd43](https://github.com/cowprotocol/cow-sdk/commit/01ebd437bd0d54d601a3f00f3ebd2bffd58f7a93))
* rename getTokenAddressKey to getAddressKey ([#793](https://github.com/cowprotocol/cow-sdk/issues/793)) ([7fbb9ae](https://github.com/cowprotocol/cow-sdk/commit/7fbb9ae54fb8ce6df78126d2e6c3ac3495a5ded7))
* **sdk-agnostic-lib:** Add composable package ([bf3f864](https://github.com/cowprotocol/cow-sdk/commit/bf3f864815326813bbb18d2d98d10345d9aa6a2b))
* **sdk-agnostic-lib:** create app data package ([#327](https://github.com/cowprotocol/cow-sdk/issues/327)) ([8b61261](https://github.com/cowprotocol/cow-sdk/commit/8b612615bc280dee2e5f4767794bc03f590d4764))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* test release of packages ([#487](https://github.com/cowprotocol/cow-sdk/issues/487)) ([a6abbfe](https://github.com/cowprotocol/cow-sdk/commit/a6abbfe44ce68f8d32e5350dca2fa12f76826456))
* update settlement and vault relayer contracts on staging ([#807](https://github.com/cowprotocol/cow-sdk/issues/807)) ([0f9a03e](https://github.com/cowprotocol/cow-sdk/commit/0f9a03e6bfa3468630e46735f7583618ae711b73))


### = Bug Fixes

* add adapter param to BridgingSdk and update docs ([#450](https://github.com/cowprotocol/cow-sdk/issues/450)) ([667a36e](https://github.com/cowprotocol/cow-sdk/commit/667a36e4437309e1d292b8f9fd5e8f568922749f))
* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **slippage:** use volatility slippage to calculate volume slippage ([#574](https://github.com/cowprotocol/cow-sdk/issues/574)) ([0d86551](https://github.com/cowprotocol/cow-sdk/commit/0d8655153199707bed13b8303dac4a7c5d50a57a))
* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))


### { Refactoring

* move cow-error and wallets.ts and remove duplicate types ([4a7e5d6](https://github.com/cowprotocol/cow-sdk/commit/4a7e5d6d035ccebf05cce437f0409220f39b643a))


### =Ú Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

* add hashDomain to abstract utils ([f8692c1](https://github.com/cowprotocol/cow-sdk/commit/f8692c1c03b372076f785546d8f022be84206a1d))
* **cow-shed:** copy wallets.ts ([d187b04](https://github.com/cowprotocol/cow-sdk/commit/d187b0493acef0442288aad5265b63252f9d1674))
* fix lint and remove cow-sdk from lint. ([46decb7](https://github.com/cowprotocol/cow-sdk/commit/46decb72050c1b9481b24d9b10b6a4c4f2abe0c3))
* migrate latest changes from main 26-08-2025 ([#445](https://github.com/cowprotocol/cow-sdk/issues/445)) ([698937c](https://github.com/cowprotocol/cow-sdk/commit/698937c0feff3a254873371bc1ef791917e6294e))
* move constants to sdk-common ([c1336c3](https://github.com/cowprotocol/cow-sdk/commit/c1336c3af5dc51c649c9435919e5e1054a6f94d5))
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
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 2.0.0
</details>

<details><summary>sdk-composable: 1.0.0</summary>

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-composable-v0.2.0...sdk-composable-v1.0.0) (2026-03-16)


###   BREAKING CHANGES

* release cow-sdk v7

### ( Features

* enhance composable to test the 3 adapters ([7d1bd77](https://github.com/cowprotocol/cow-sdk/commit/7d1bd776b40a10808b9f6392dda862f610131169))
* move composable package from original sdk to refactor sdk ([a462634](https://github.com/cowprotocol/cow-sdk/commit/a462634111bec8c48444c721381b0cb012fc7ebe))
* refactor composable module to be framework-agnostic ([55032a2](https://github.com/cowprotocol/cow-sdk/commit/55032a2ca11d38d343f5f2c07c96b422671fa9e6))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** Add composable package ([bf3f864](https://github.com/cowprotocol/cow-sdk/commit/bf3f864815326813bbb18d2d98d10345d9aa6a2b))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* update settlement and vault relayer contracts on staging ([#807](https://github.com/cowprotocol/cow-sdk/issues/807)) ([0f9a03e](https://github.com/cowprotocol/cow-sdk/commit/0f9a03e6bfa3468630e46735f7583618ae711b73))
* update tests to work with ethersV5 adapter ([42a6e5d](https://github.com/cowprotocol/cow-sdk/commit/42a6e5ddf2cdfc59562f095b10158b6a6b9377f7))


### = Bug Fixes

* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))


### =Ú Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

* move composable tests file to composable/tests ([9ab599a](https://github.com/cowprotocol/cow-sdk/commit/9ab599abf0c5839456e6bd87b7580fe3f232509f))
* move constants to sdk-common ([c1336c3](https://github.com/cowprotocol/cow-sdk/commit/c1336c3af5dc51c649c9435919e5e1054a6f94d5))
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
* release main ([#575](https://github.com/cowprotocol/cow-sdk/issues/575)) ([2ef068b](https://github.com/cowprotocol/cow-sdk/commit/2ef068b851e5d114784f81ecbcd0fe3c512b7570))
* release main ([#581](https://github.com/cowprotocol/cow-sdk/issues/581)) ([0f09262](https://github.com/cowprotocol/cow-sdk/commit/0f0926297da8949de97379e7300a1e5301bde724))
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
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#741](https://github.com/cowprotocol/cow-sdk/issues/741)) ([32fb8bb](https://github.com/cowprotocol/cow-sdk/commit/32fb8bbe6b1172c2666f330d0d50cdc2f7c2554f))
* release main ([#742](https://github.com/cowprotocol/cow-sdk/issues/742)) ([8c8d857](https://github.com/cowprotocol/cow-sdk/commit/8c8d857e9c9da59b8793f2f9dfb3ca075891e6e3))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#751](https://github.com/cowprotocol/cow-sdk/issues/751)) ([885d7f7](https://github.com/cowprotocol/cow-sdk/commit/885d7f707bf2074dfb80df6ebcf41c12515695e3))
* release main ([#754](https://github.com/cowprotocol/cow-sdk/issues/754)) ([3f2f53c](https://github.com/cowprotocol/cow-sdk/commit/3f2f53cdf66520d2f2c8fd82df2b614bc202eb6b))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#778](https://github.com/cowprotocol/cow-sdk/issues/778)) ([d84e4a3](https://github.com/cowprotocol/cow-sdk/commit/d84e4a3a5d918a6ba28879a20798510eb84cbf12))
* release main ([#779](https://github.com/cowprotocol/cow-sdk/issues/779)) ([6387df5](https://github.com/cowprotocol/cow-sdk/commit/6387df570750f4411ad57e3aed709b4eb848557c))
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
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* remove console logs ([ce11a98](https://github.com/cowprotocol/cow-sdk/commit/ce11a98a36e609e963d51b8ffce1cb1995fe090f))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 3.0.0
    * @cowprotocol/sdk-order-book bumped to 3.0.0
    * @cowprotocol/sdk-order-signing bumped to 1.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0
</details>

<details><summary>sdk-config: 2.0.0</summary>

## [2.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-config-v1.1.0...sdk-config-v2.0.0) (2026-03-16)


###   BREAKING CHANGES

* **chains:** Remove support for Lens.
* release cow-sdk v7

### ( Features

* add API endpoints for partners ([#809](https://github.com/cowprotocol/cow-sdk/issues/809)) ([59900e8](https://github.com/cowprotocol/cow-sdk/commit/59900e854a336e294ec881bd70bb13e579ff48ec))
* add isUnderDevelopment flag to chain info ([#597](https://github.com/cowprotocol/cow-sdk/issues/597)) ([f502fa9](https://github.com/cowprotocol/cow-sdk/commit/f502fa9aea85915ef92192539ec1ff9f2651e534))
* add monorepo package network images ([#429](https://github.com/cowprotocol/cow-sdk/issues/429)) ([56ef05b](https://github.com/cowprotocol/cow-sdk/commit/56ef05b84a25955cbe6d1f8f74df0ff0fa2bdfff))
* Add non-evm chains types & guards & address validators  ([#792](https://github.com/cowprotocol/cow-sdk/issues/792)) ([b4b6047](https://github.com/cowprotocol/cow-sdk/commit/b4b6047889190f668f6409aeee7079ba6095f9ae))
* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))
* **chains:** Remove Lens ([#818](https://github.com/cowprotocol/cow-sdk/issues/818)) ([e8c74a0](https://github.com/cowprotocol/cow-sdk/commit/e8c74a078e5940901591652164af7b2ffb7b1fa6))
* create config package ([212c4a7](https://github.com/cowprotocol/cow-sdk/commit/212c4a74eae46ff6150138300334e0565f581ad1))
* **deprecated-chains:** add isDeprecated flag and mark Lens as such ([#801](https://github.com/cowprotocol/cow-sdk/issues/801)) ([e0663c6](https://github.com/cowprotocol/cow-sdk/commit/e0663c69c0b5d92bae45570f27105d6cfd04b96a))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))
* refactor config ([f7fcf73](https://github.com/cowprotocol/cow-sdk/commit/f7fcf73a7fde59b47a5aa2432fddea8e1648fd94))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* test release of packages ([#485](https://github.com/cowprotocol/cow-sdk/issues/485)) ([74109d8](https://github.com/cowprotocol/cow-sdk/commit/74109d893417c14c1ee476be8040704183e800c6))
* update settlement and vault relayer contracts on staging ([#807](https://github.com/cowprotocol/cow-sdk/issues/807)) ([0f9a03e](https://github.com/cowprotocol/cow-sdk/commit/0f9a03e6bfa3468630e46735f7583618ae711b73))
* use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([1b23c5e](https://github.com/cowprotocol/cow-sdk/commit/1b23c5e5f7e1763b710b95f444ad052395808277))
* use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([2a8e220](https://github.com/cowprotocol/cow-sdk/commit/2a8e2205acc5143efecbc9caee89d01f32570e0d))


### = Bug Fixes

* **config:** make native token address lower in url ([#499](https://github.com/cowprotocol/cow-sdk/issues/499)) ([96e0dc6](https://github.com/cowprotocol/cow-sdk/commit/96e0dc6fd837f9b67025d6e05959ad9b773c0ed4))
* fix gnosis native token url ([#501](https://github.com/cowprotocol/cow-sdk/issues/501)) ([4d5176e](https://github.com/cowprotocol/cow-sdk/commit/4d5176e85594f45d96a5d9d7aa7285cbf3cfebf2))
* **ink:** swap Ink logo with filled version ([#783](https://github.com/cowprotocol/cow-sdk/issues/783)) ([bfc0ba7](https://github.com/cowprotocol/cow-sdk/commit/bfc0ba72108bf376bdcdd2194ba312c6b8a50e3a))
* linea no longer under dev ([#734](https://github.com/cowprotocol/cow-sdk/issues/734)) ([548bf29](https://github.com/cowprotocol/cow-sdk/commit/548bf2917a71117bf981b254d0211baacdbc9fff))
* migrate lens eth-flow contract address ([#468](https://github.com/cowprotocol/cow-sdk/issues/468)) ([91c87b2](https://github.com/cowprotocol/cow-sdk/commit/91c87b2e31c1b80ef1703d986f4c49811897f3a0))
* **networks:** remove isUnderDevelopment flag from Ink ([#803](https://github.com/cowprotocol/cow-sdk/issues/803)) ([8baeaa6](https://github.com/cowprotocol/cow-sdk/commit/8baeaa657f0f7760ea26917b68cbf0ab70ac4905))
* **networks:** remove isUnderDevelopment flag from Ink ([#803](https://github.com/cowprotocol/cow-sdk/issues/803)) ([8baeaa6](https://github.com/cowprotocol/cow-sdk/commit/8baeaa657f0f7760ea26917b68cbf0ab70ac4905))
* remove isUnderDevelopment flag from plasma ([#739](https://github.com/cowprotocol/cow-sdk/issues/739)) ([b9cf7b7](https://github.com/cowprotocol/cow-sdk/commit/b9cf7b7a6405d27b11719128a7680a771bc3e602))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))
* unify spelling for chain explorers ([#773](https://github.com/cowprotocol/cow-sdk/issues/773)) ([e89c4ba](https://github.com/cowprotocol/cow-sdk/commit/e89c4baa769b9f14982e8f4c7d19fdb8a6e2e5f6))
* use the blue linea logo instead of the yellow one ([#717](https://github.com/cowprotocol/cow-sdk/issues/717)) ([e044446](https://github.com/cowprotocol/cow-sdk/commit/e0444463b7097b8ebc0134aeacfdf460e4b51684))


### { Refactoring

* move cow-error and wallets.ts and remove duplicate types ([4a7e5d6](https://github.com/cowprotocol/cow-sdk/commit/4a7e5d6d035ccebf05cce437f0409220f39b643a))


### =Ú Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

* migrate latest changes from main 26-08-2025 ([#445](https://github.com/cowprotocol/cow-sdk/issues/445)) ([698937c](https://github.com/cowprotocol/cow-sdk/commit/698937c0feff3a254873371bc1ef791917e6294e))
* release main ([#453](https://github.com/cowprotocol/cow-sdk/issues/453)) ([36080c1](https://github.com/cowprotocol/cow-sdk/commit/36080c1955f5f161bebce7867af110f6938e5c95))
* release main ([#467](https://github.com/cowprotocol/cow-sdk/issues/467)) ([ed2977a](https://github.com/cowprotocol/cow-sdk/commit/ed2977a82bb2f4b43de900840848e33532d001f0))
* release main ([#486](https://github.com/cowprotocol/cow-sdk/issues/486)) ([cf53df2](https://github.com/cowprotocol/cow-sdk/commit/cf53df2d0f5e96a544165547958ecc959c1948d7))
* release main ([#500](https://github.com/cowprotocol/cow-sdk/issues/500)) ([76c5185](https://github.com/cowprotocol/cow-sdk/commit/76c5185d4b827d185af11bef9435fbed87484b0b))
* release main ([#502](https://github.com/cowprotocol/cow-sdk/issues/502)) ([c452d8e](https://github.com/cowprotocol/cow-sdk/commit/c452d8e53bc0dcd79052b1877d2c48a32777093e))
* release main ([#503](https://github.com/cowprotocol/cow-sdk/issues/503)) ([532d8eb](https://github.com/cowprotocol/cow-sdk/commit/532d8eb2a0a0f9ec5775e566fe2507f1ccc4f961))
* release main ([#515](https://github.com/cowprotocol/cow-sdk/issues/515)) ([912e315](https://github.com/cowprotocol/cow-sdk/commit/912e31551440ebfa61d7d2f5c846d61162559448))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#718](https://github.com/cowprotocol/cow-sdk/issues/718)) ([87683ec](https://github.com/cowprotocol/cow-sdk/commit/87683ecc507e59d70a6d623faba83cda65ca44cc))
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* remove unused lens assets ([#823](https://github.com/cowprotocol/cow-sdk/issues/823)) ([9cb9513](https://github.com/cowprotocol/cow-sdk/commit/9cb9513e49aa22a3a0f33546184b17f89d3d9c76))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* revert use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([f73bc96](https://github.com/cowprotocol/cow-sdk/commit/f73bc96156796ce4928f64f963295501dfc69a5c))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
* update sdk-config tsconfig ([8666af4](https://github.com/cowprotocol/cow-sdk/commit/8666af48c60cd1d6e945f8412b192029299f7c90))
</details>

<details><summary>sdk-contracts-ts: 3.0.0</summary>

## [3.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-contracts-ts-v2.1.0...sdk-contracts-ts-v3.0.0) (2026-03-16)


###   BREAKING CHANGES

* **chains:** Remove support for Lens.
* **bridge:** split swap and bridge slippages ([#750](https://github.com/cowprotocol/cow-sdk/issues/750))
* release cow-sdk v7 ([#514](https://github.com/cowprotocol/cow-sdk/issues/514))

### ( Features

* add API endpoints for partners ([#809](https://github.com/cowprotocol/cow-sdk/issues/809)) ([59900e8](https://github.com/cowprotocol/cow-sdk/commit/59900e854a336e294ec881bd70bb13e579ff48ec))
* add contracts-ts package ([780a60f](https://github.com/cowprotocol/cow-sdk/commit/780a60f58bc67b27f161b0abab1f8ef81b2ea64b))
* add contracts-ts package ([af47c0c](https://github.com/cowprotocol/cow-sdk/commit/af47c0cbe1ff93378decdcd4813645a5aeb67288))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* Add non-evm chains types & guards & address validators  ([#792](https://github.com/cowprotocol/cow-sdk/issues/792)) ([b4b6047](https://github.com/cowprotocol/cow-sdk/commit/b4b6047889190f668f6409aeee7079ba6095f9ae))
* add tests for contracts-ts ([4f39d4d](https://github.com/cowprotocol/cow-sdk/commit/4f39d4d37bf2f67a2686ac6709795c01f4a43ad0))
* add tests for contracts-ts ([9d6a4b8](https://github.com/cowprotocol/cow-sdk/commit/9d6a4b8d3eeaf7a62312f3d1747df3528fd7fbe4))
* allow new code property in referrer schema ([#774](https://github.com/cowprotocol/cow-sdk/issues/774)) ([2b648b6](https://github.com/cowprotocol/cow-sdk/commit/2b648b6a1db03fd34002c49572d8e8e556d03593))
* **bridge:** add a flag to control intermediate=sell token ([#777](https://github.com/cowprotocol/cow-sdk/issues/777)) ([588dffa](https://github.com/cowprotocol/cow-sdk/commit/588dffaf418b8220293fe803186e3801597282d0))
* **bridge:** add quote id and signature metadata ([#701](https://github.com/cowprotocol/cow-sdk/issues/701)) ([35a25a7](https://github.com/cowprotocol/cow-sdk/commit/35a25a7fcc2724073355b3dba4b8f6d3b7419032))
* **bridge:** allow sell token as intermediate token ([#768](https://github.com/cowprotocol/cow-sdk/issues/768)) ([8c367ac](https://github.com/cowprotocol/cow-sdk/commit/8c367ac704ad10003618c8916e32529c5c9eb815))
* **bridge:** determine intermediate token ([#738](https://github.com/cowprotocol/cow-sdk/issues/738)) ([381e885](https://github.com/cowprotocol/cow-sdk/commit/381e885d398623cfd731b439e7e62e8b863736c8))
* **bridge:** make multi-quote method progressive ([#526](https://github.com/cowprotocol/cow-sdk/issues/526)) ([27536c6](https://github.com/cowprotocol/cow-sdk/commit/27536c63ec91a26323ffb341c1edbef0ab9331a3))
* **bridge:** split swap and bridge slippages ([#750](https://github.com/cowprotocol/cow-sdk/issues/750)) ([3ae7b57](https://github.com/cowprotocol/cow-sdk/commit/3ae7b574d1215ae598ec0a519ec003a9f21b7a7f))
* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))
* **chains:** Remove Lens ([#818](https://github.com/cowprotocol/cow-sdk/issues/818)) ([e8c74a0](https://github.com/cowprotocol/cow-sdk/commit/e8c74a078e5940901591652164af7b2ffb7b1fa6))
* **cow-shed:** refact on common and contract-ts ([4be05aa](https://github.com/cowprotocol/cow-sdk/commit/4be05aa7a376fbc7d2ed5b2d2b6b68e3630b9c59))
* **cow-shed:** validate EIP1271 signature ([#508](https://github.com/cowprotocol/cow-sdk/issues/508)) ([5c72123](https://github.com/cowprotocol/cow-sdk/commit/5c7212323edcea3eadf70973f765619afb1bcaf4))
* **deprecated-chains:** add isDeprecated flag and mark Lens as such ([#801](https://github.com/cowprotocol/cow-sdk/issues/801)) ([e0663c6](https://github.com/cowprotocol/cow-sdk/commit/e0663c69c0b5d92bae45570f27105d6cfd04b96a))
* **flash-loans:** support Mainnet, Gnosis, and Base for AAVE ([#657](https://github.com/cowprotocol/cow-sdk/issues/657)) ([c7f2327](https://github.com/cowprotocol/cow-sdk/commit/c7f2327f4672a899c2775dd8ab8d3543ad08cdd6))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* move address utils ([#795](https://github.com/cowprotocol/cow-sdk/issues/795)) ([d18212c](https://github.com/cowprotocol/cow-sdk/commit/d18212c868ca2c16525a530f7914c9440f147414))
* refactor contracts-ts ([2e14272](https://github.com/cowprotocol/cow-sdk/commit/2e14272f1a24a232aef584611924055ed657d16c))
* refactor contracts-ts ([b441360](https://github.com/cowprotocol/cow-sdk/commit/b4413600d4a0753e9f608e6a6415e64762a53d3e))
* release cow-sdk v7 ([#514](https://github.com/cowprotocol/cow-sdk/issues/514)) ([01ebd43](https://github.com/cowprotocol/cow-sdk/commit/01ebd437bd0d54d601a3f00f3ebd2bffd58f7a93))
* **sdk-agnostic-lib:** Add composable package ([bf3f864](https://github.com/cowprotocol/cow-sdk/commit/bf3f864815326813bbb18d2d98d10345d9aa6a2b))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* simplify OrderSigningUtils to use static methods only ([#417](https://github.com/cowprotocol/cow-sdk/issues/417)) ([899ca43](https://github.com/cowprotocol/cow-sdk/commit/899ca4325be831b6711468d1df3733d98fe913b0))
* **trading:** add validTo parameter to getQuote ([#576](https://github.com/cowprotocol/cow-sdk/issues/576)) ([fcf4258](https://github.com/cowprotocol/cow-sdk/commit/fcf425806044c0ea8b83cfb4116d2f7fb9fcc6e0))
* **trading:** use suggested slippage from BFF ([#546](https://github.com/cowprotocol/cow-sdk/issues/546)) ([b6a59c7](https://github.com/cowprotocol/cow-sdk/commit/b6a59c780fbfb0f2e840276fe905b2efd810805c))
* update settlement and vault relayer contracts on staging ([#807](https://github.com/cowprotocol/cow-sdk/issues/807)) ([0f9a03e](https://github.com/cowprotocol/cow-sdk/commit/0f9a03e6bfa3468630e46735f7583618ae711b73))


### = Bug Fixes

* add optional apiKey for NearIntentsBridgeProvider ([#775](https://github.com/cowprotocol/cow-sdk/issues/775)) ([7546a4c](https://github.com/cowprotocol/cow-sdk/commit/7546a4c75fe43b5ee8381a45eb6608d5e8593436))
* **app-data:** fix typos and ids in schemas ([#586](https://github.com/cowprotocol/cow-sdk/issues/586)) ([5a4461a](https://github.com/cowprotocol/cow-sdk/commit/5a4461a2a171689db04f7c805c9e2c835bbd36dd))
* avoid using adapter in normalizeOrder ([#523](https://github.com/cowprotocol/cow-sdk/issues/523)) ([7c196c3](https://github.com/cowprotocol/cow-sdk/commit/7c196c39a6694924cbec09f159dd237da39d73a2))
* **bridge:** fix applying affiliate header ([#492](https://github.com/cowprotocol/cow-sdk/issues/492)) ([e4f49c6](https://github.com/cowprotocol/cow-sdk/commit/e4f49c64e60f4aeac97b6b246c36090946df6fcf))
* **bridge:** multi-quote strategies should not swallow BridgeProviderQuoteError ([#533](https://github.com/cowprotocol/cow-sdk/issues/533)) ([7789699](https://github.com/cowprotocol/cow-sdk/commit/77896999aa2140b70cd2919ede279eb7ebcf0b7b))
* flashloan fee calculation now matches aave's ([#622](https://github.com/cowprotocol/cow-sdk/issues/622)) ([8d11b7f](https://github.com/cowprotocol/cow-sdk/commit/8d11b7fbbc8ff797253f26772a0e5c940286f2d9))
* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **networks:** remove deprecated network check/error from trading sdk ([#804](https://github.com/cowprotocol/cow-sdk/issues/804)) ([210d26e](https://github.com/cowprotocol/cow-sdk/commit/210d26e556fd79c8a3ac7b8f45f33e766ade4e18))
* rename ether to ethers ([#504](https://github.com/cowprotocol/cow-sdk/issues/504)) ([eaf2705](https://github.com/cowprotocol/cow-sdk/commit/eaf2705f269352d3bc2908eb3335ff56ef426823))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))
* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))
* update contracts pck version ([#831](https://github.com/cowprotocol/cow-sdk/issues/831)) ([79e0904](https://github.com/cowprotocol/cow-sdk/commit/79e0904e65f0e019f478f1b46e094637f7a763d9))


### =Ú Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

* apply PR suggestions ([2ff0f7c](https://github.com/cowprotocol/cow-sdk/commit/2ff0f7c74c377b67824da3ba6390edccdaad94f5))
* bump sdk beta version ([#473](https://github.com/cowprotocol/cow-sdk/issues/473)) ([00142d3](https://github.com/cowprotocol/cow-sdk/commit/00142d3e524ebf7a023814ba91ee3a66ed796444))
* fix merge ([5c511de](https://github.com/cowprotocol/cow-sdk/commit/5c511deedd0c7821df6affefc9623c79a68c96c7))
* **lint:** lint ([881e345](https://github.com/cowprotocol/cow-sdk/commit/881e3451add9d911047daebe4e36fe777d95927a))
* merge main 28-06-2025 ([#452](https://github.com/cowprotocol/cow-sdk/issues/452)) ([4c198ce](https://github.com/cowprotocol/cow-sdk/commit/4c198ce34890740bf0a0fe859620a9e1ad432bed))
* release main ([#453](https://github.com/cowprotocol/cow-sdk/issues/453)) ([36080c1](https://github.com/cowprotocol/cow-sdk/commit/36080c1955f5f161bebce7867af110f6938e5c95))
* release main ([#467](https://github.com/cowprotocol/cow-sdk/issues/467)) ([ed2977a](https://github.com/cowprotocol/cow-sdk/commit/ed2977a82bb2f4b43de900840848e33532d001f0))
* release main ([#474](https://github.com/cowprotocol/cow-sdk/issues/474)) ([02e47a4](https://github.com/cowprotocol/cow-sdk/commit/02e47a4af7a3d6c3d9d24aa15f30dde1b4672d7d))
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
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#637](https://github.com/cowprotocol/cow-sdk/issues/637)) ([6909e8d](https://github.com/cowprotocol/cow-sdk/commit/6909e8d5e97afadc203be2293865bfb2f9338953))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#650](https://github.com/cowprotocol/cow-sdk/issues/650)) ([2493612](https://github.com/cowprotocol/cow-sdk/commit/24936120e51b0083eda408ab80b8f8ee4115e223))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#702](https://github.com/cowprotocol/cow-sdk/issues/702)) ([1e6b54d](https://github.com/cowprotocol/cow-sdk/commit/1e6b54dbaef21a61c362bc2d1567d87f14d7f8a7))
* release main ([#718](https://github.com/cowprotocol/cow-sdk/issues/718)) ([87683ec](https://github.com/cowprotocol/cow-sdk/commit/87683ecc507e59d70a6d623faba83cda65ca44cc))
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#741](https://github.com/cowprotocol/cow-sdk/issues/741)) ([32fb8bb](https://github.com/cowprotocol/cow-sdk/commit/32fb8bbe6b1172c2666f330d0d50cdc2f7c2554f))
* release main ([#742](https://github.com/cowprotocol/cow-sdk/issues/742)) ([8c8d857](https://github.com/cowprotocol/cow-sdk/commit/8c8d857e9c9da59b8793f2f9dfb3ca075891e6e3))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#751](https://github.com/cowprotocol/cow-sdk/issues/751)) ([885d7f7](https://github.com/cowprotocol/cow-sdk/commit/885d7f707bf2074dfb80df6ebcf41c12515695e3))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#778](https://github.com/cowprotocol/cow-sdk/issues/778)) ([d84e4a3](https://github.com/cowprotocol/cow-sdk/commit/d84e4a3a5d918a6ba28879a20798510eb84cbf12))
* release main ([#779](https://github.com/cowprotocol/cow-sdk/issues/779)) ([6387df5](https://github.com/cowprotocol/cow-sdk/commit/6387df570750f4411ad57e3aed709b4eb848557c))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* remove console logs ([ce11a98](https://github.com/cowprotocol/cow-sdk/commit/ce11a98a36e609e963d51b8ffce1cb1995fe090f))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
* update contracts-ts config ([68360fc](https://github.com/cowprotocol/cow-sdk/commit/68360fc030cd269d13d5aee8f2e89b53c4b4fc74))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-config bumped to 2.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0
</details>

<details><summary>sdk-cow-shed: 1.0.0</summary>

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-cow-shed-v0.3.0...sdk-cow-shed-v1.0.0) (2026-03-16)


###   BREAKING CHANGES

* release cow-sdk v7

### ( Features

* **cow-shed:** add ttl cache for RPC calls ([#644](https://github.com/cowprotocol/cow-sdk/issues/644)) ([10e1139](https://github.com/cowprotocol/cow-sdk/commit/10e1139f4e8d75ea2c737937d276835a1692ff8a))
* **cow-shed:** create package.json and tsconfig.json ([2548f17](https://github.com/cowprotocol/cow-sdk/commit/2548f17f75319d9615a814fdae5d13c25b9220ee))
* **cow-shed:** refact cow-she to use adapters and fix tests ([25b0986](https://github.com/cowprotocol/cow-sdk/commit/25b098630ae7850e6d09dcdfc9dcd67266cd7df1))
* **cow-shed:** validate EIP1271 signature ([#508](https://github.com/cowprotocol/cow-sdk/issues/508)) ([5c72123](https://github.com/cowprotocol/cow-sdk/commit/5c7212323edcea3eadf70973f765619afb1bcaf4))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* update settlement and vault relayer contracts on staging ([#807](https://github.com/cowprotocol/cow-sdk/issues/807)) ([0f9a03e](https://github.com/cowprotocol/cow-sdk/commit/0f9a03e6bfa3468630e46735f7583618ae711b73))


### = Bug Fixes

* **cow-shed:** fix adapters - estimateGas  and encodeAbi ([76ab995](https://github.com/cowprotocol/cow-sdk/commit/76ab995635247e63213dafb50ff462334977cc6d))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))


### =Ú Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

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
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#637](https://github.com/cowprotocol/cow-sdk/issues/637)) ([6909e8d](https://github.com/cowprotocol/cow-sdk/commit/6909e8d5e97afadc203be2293865bfb2f9338953))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#650](https://github.com/cowprotocol/cow-sdk/issues/650)) ([2493612](https://github.com/cowprotocol/cow-sdk/commit/24936120e51b0083eda408ab80b8f8ee4115e223))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#702](https://github.com/cowprotocol/cow-sdk/issues/702)) ([1e6b54d](https://github.com/cowprotocol/cow-sdk/commit/1e6b54dbaef21a61c362bc2d1567d87f14d7f8a7))
* release main ([#718](https://github.com/cowprotocol/cow-sdk/issues/718)) ([87683ec](https://github.com/cowprotocol/cow-sdk/commit/87683ecc507e59d70a6d623faba83cda65ca44cc))
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#741](https://github.com/cowprotocol/cow-sdk/issues/741)) ([32fb8bb](https://github.com/cowprotocol/cow-sdk/commit/32fb8bbe6b1172c2666f330d0d50cdc2f7c2554f))
* release main ([#742](https://github.com/cowprotocol/cow-sdk/issues/742)) ([8c8d857](https://github.com/cowprotocol/cow-sdk/commit/8c8d857e9c9da59b8793f2f9dfb3ca075891e6e3))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#751](https://github.com/cowprotocol/cow-sdk/issues/751)) ([885d7f7](https://github.com/cowprotocol/cow-sdk/commit/885d7f707bf2074dfb80df6ebcf41c12515695e3))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#778](https://github.com/cowprotocol/cow-sdk/issues/778)) ([d84e4a3](https://github.com/cowprotocol/cow-sdk/commit/d84e4a3a5d918a6ba28879a20798510eb84cbf12))
* release main ([#779](https://github.com/cowprotocol/cow-sdk/issues/779)) ([6387df5](https://github.com/cowprotocol/cow-sdk/commit/6387df570750f4411ad57e3aed709b4eb848557c))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
* **subgraph:** move cow-shed to monorepo package ([2e7b27a](https://github.com/cowprotocol/cow-sdk/commit/2e7b27ae5ec04d03dc919cf508b1c4eb723818aa))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 3.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0
</details>

<details><summary>sdk-ethers-v5-adapter: 1.0.0</summary>

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-ethers-v5-adapter-v0.3.12...sdk-ethers-v5-adapter-v1.0.0) (2026-03-16)


###   BREAKING CHANGES

* release cow-sdk v7

### ( Features

* add from/to fields for receipt ([#629](https://github.com/cowprotocol/cow-sdk/issues/629)) ([3dd3868](https://github.com/cowprotocol/cow-sdk/commit/3dd38682741ac93bfbd9b7d9a4fe79df7283dca0))
* **bridge:** add NearIntents bridge provider ([#663](https://github.com/cowprotocol/cow-sdk/issues/663)) ([afd63bc](https://github.com/cowprotocol/cow-sdk/commit/afd63bce3765e2adc81b73357e233399111e3595))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))


### = Bug Fixes

* rename ether to ethers ([#504](https://github.com/cowprotocol/cow-sdk/issues/504)) ([eaf2705](https://github.com/cowprotocol/cow-sdk/commit/eaf2705f269352d3bc2908eb3335ff56ef426823))


### =' Miscellaneous

* release main ([#505](https://github.com/cowprotocol/cow-sdk/issues/505)) ([0f98564](https://github.com/cowprotocol/cow-sdk/commit/0f985640c6e6f0852505cb3ad66c07bd3f23ea7b))
* release main ([#511](https://github.com/cowprotocol/cow-sdk/issues/511)) ([5629bb2](https://github.com/cowprotocol/cow-sdk/commit/5629bb25f89b62e490b9819393036994688bf648))
* release main ([#515](https://github.com/cowprotocol/cow-sdk/issues/515)) ([912e315](https://github.com/cowprotocol/cow-sdk/commit/912e31551440ebfa61d7d2f5c846d61162559448))
* release main ([#542](https://github.com/cowprotocol/cow-sdk/issues/542)) ([e9f98a6](https://github.com/cowprotocol/cow-sdk/commit/e9f98a623cf81f4a9246550999914c88eb1fca30))
* release main ([#575](https://github.com/cowprotocol/cow-sdk/issues/575)) ([2ef068b](https://github.com/cowprotocol/cow-sdk/commit/2ef068b851e5d114784f81ecbcd0fe3c512b7570))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
</details>

<details><summary>sdk-ethers-v6-adapter: 1.0.0</summary>

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-ethers-v6-adapter-v0.3.12...sdk-ethers-v6-adapter-v1.0.0) (2026-03-16)


###   BREAKING CHANGES

* release cow-sdk v7

### ( Features

* add from/to fields for receipt ([#629](https://github.com/cowprotocol/cow-sdk/issues/629)) ([3dd3868](https://github.com/cowprotocol/cow-sdk/commit/3dd38682741ac93bfbd9b7d9a4fe79df7283dca0))
* **bridge:** add NearIntents bridge provider ([#663](https://github.com/cowprotocol/cow-sdk/issues/663)) ([afd63bc](https://github.com/cowprotocol/cow-sdk/commit/afd63bce3765e2adc81b73357e233399111e3595))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))


### = Bug Fixes

* rename ether to ethers ([#504](https://github.com/cowprotocol/cow-sdk/issues/504)) ([eaf2705](https://github.com/cowprotocol/cow-sdk/commit/eaf2705f269352d3bc2908eb3335ff56ef426823))


### =' Miscellaneous

* release main ([#505](https://github.com/cowprotocol/cow-sdk/issues/505)) ([0f98564](https://github.com/cowprotocol/cow-sdk/commit/0f985640c6e6f0852505cb3ad66c07bd3f23ea7b))
* release main ([#511](https://github.com/cowprotocol/cow-sdk/issues/511)) ([5629bb2](https://github.com/cowprotocol/cow-sdk/commit/5629bb25f89b62e490b9819393036994688bf648))
* release main ([#515](https://github.com/cowprotocol/cow-sdk/issues/515)) ([912e315](https://github.com/cowprotocol/cow-sdk/commit/912e31551440ebfa61d7d2f5c846d61162559448))
* release main ([#542](https://github.com/cowprotocol/cow-sdk/issues/542)) ([e9f98a6](https://github.com/cowprotocol/cow-sdk/commit/e9f98a623cf81f4a9246550999914c88eb1fca30))
* release main ([#575](https://github.com/cowprotocol/cow-sdk/issues/575)) ([2ef068b](https://github.com/cowprotocol/cow-sdk/commit/2ef068b851e5d114784f81ecbcd0fe3c512b7570))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
</details>

<details><summary>sdk-flash-loans: 3.0.0</summary>

## [3.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v2.0.1...sdk-flash-loans-v3.0.0) (2026-03-16)


###   BREAKING CHANGES

* **chains:** Remove support for Lens.

### ( Features

* allow aave sdk to provide the helper addresses in the construct& ([#666](https://github.com/cowprotocol/cow-sdk/issues/666)) ([828ae7d](https://github.com/cowprotocol/cow-sdk/commit/828ae7d120a06b9d550c9f7c1e52bb86f783d0b8))
* **chains:** Remove Lens ([#818](https://github.com/cowprotocol/cow-sdk/issues/818)) ([e8c74a0](https://github.com/cowprotocol/cow-sdk/commit/e8c74a078e5940901591652164af7b2ffb7b1fa6))
* **flash-loans:** add dappId to aave hooks ([#645](https://github.com/cowprotocol/cow-sdk/issues/645)) ([b5312af](https://github.com/cowprotocol/cow-sdk/commit/b5312af11d2b164c125aa899a56ee0b1645ba18f))
* **flash-loans:** support debtSwap and repayCollateral ([#616](https://github.com/cowprotocol/cow-sdk/issues/616)) ([cdd9f8a](https://github.com/cowprotocol/cow-sdk/commit/cdd9f8a3fdc73be56d727f0ec320c2f11516f778))
* **flash-loans:** support flexible gasLimit options ([#736](https://github.com/cowprotocol/cow-sdk/issues/736)) ([14cbb36](https://github.com/cowprotocol/cow-sdk/commit/14cbb362a68462dddc028d5f5852f038f349daa3))
* **flash-loans:** support Mainnet, Gnosis, and Base for AAVE ([#657](https://github.com/cowprotocol/cow-sdk/issues/657)) ([c7f2327](https://github.com/cowprotocol/cow-sdk/commit/c7f2327f4672a899c2775dd8ab8d3543ad08cdd6))
* **flash-loans:** update smartcontract addresses ([#676](https://github.com/cowprotocol/cow-sdk/issues/676)) ([3d78116](https://github.com/cowprotocol/cow-sdk/commit/3d781167dfe6a02646c546b481f058d2ed0f664f))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))


### = Bug Fixes

* fix lint issues ([#631](https://github.com/cowprotocol/cow-sdk/issues/631)) ([2152be4](https://github.com/cowprotocol/cow-sdk/commit/2152be4f75017f033ca7eba0959d82691cef6ee3))
* **flash-loans:** add hooksGasLimit parameter ([#691](https://github.com/cowprotocol/cow-sdk/issues/691)) ([32ebb2b](https://github.com/cowprotocol/cow-sdk/commit/32ebb2b2ae1a27e31b3ccc141ccf7ec610db2ed6))
* flashloan fee calculation now matches aave's ([#622](https://github.com/cowprotocol/cow-sdk/issues/622)) ([8d11b7f](https://github.com/cowprotocol/cow-sdk/commit/8d11b7fbbc8ff797253f26772a0e5c940286f2d9))
* make adapters hook helpers public ([#639](https://github.com/cowprotocol/cow-sdk/issues/639)) ([f8760ae](https://github.com/cowprotocol/cow-sdk/commit/f8760ae6084f7df729f140f9bea799566c217287))
* pump flashloans sdk version ([#687](https://github.com/cowprotocol/cow-sdk/issues/687)) ([d31fb42](https://github.com/cowprotocol/cow-sdk/commit/d31fb421424ed3df81de09b0e2d36b7023466931))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))
* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))


### =' Miscellaneous

* allow to set the factory contract and aave pools in the sdk ([#680](https://github.com/cowprotocol/cow-sdk/issues/680)) ([b90529c](https://github.com/cowprotocol/cow-sdk/commit/b90529cd27fdeb4060bc0a53702df6f8104495b7))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#618](https://github.com/cowprotocol/cow-sdk/issues/618)) ([c23844f](https://github.com/cowprotocol/cow-sdk/commit/c23844fd8544a29a17e60509d45b544a21dfb7d3))
* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#637](https://github.com/cowprotocol/cow-sdk/issues/637)) ([6909e8d](https://github.com/cowprotocol/cow-sdk/commit/6909e8d5e97afadc203be2293865bfb2f9338953))
* release main ([#643](https://github.com/cowprotocol/cow-sdk/issues/643)) ([203dbc6](https://github.com/cowprotocol/cow-sdk/commit/203dbc63014f2d03b2affe0d3a09a4d905d4843f))
* release main ([#646](https://github.com/cowprotocol/cow-sdk/issues/646)) ([6e67787](https://github.com/cowprotocol/cow-sdk/commit/6e67787c22bf48d787f9ea42272e1308ca98e50f))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#650](https://github.com/cowprotocol/cow-sdk/issues/650)) ([2493612](https://github.com/cowprotocol/cow-sdk/commit/24936120e51b0083eda408ab80b8f8ee4115e223))
* release main ([#667](https://github.com/cowprotocol/cow-sdk/issues/667)) ([1b04b9e](https://github.com/cowprotocol/cow-sdk/commit/1b04b9e83e5ee30cc7246dbba04ee3ef0c32c62e))
* release main ([#677](https://github.com/cowprotocol/cow-sdk/issues/677)) ([28c687f](https://github.com/cowprotocol/cow-sdk/commit/28c687fae75ad6a8c7bfc8b98f301de1cb4ce484))
* release main ([#681](https://github.com/cowprotocol/cow-sdk/issues/681)) ([435715a](https://github.com/cowprotocol/cow-sdk/commit/435715a3e8e9559408df1dd1e23080b684650cf8))
* release main ([#688](https://github.com/cowprotocol/cow-sdk/issues/688)) ([5acc4d7](https://github.com/cowprotocol/cow-sdk/commit/5acc4d7109f28cdfca402d8cb44fb029e13392d7))
* release main ([#692](https://github.com/cowprotocol/cow-sdk/issues/692)) ([f67efdb](https://github.com/cowprotocol/cow-sdk/commit/f67efdb64195da1da07570ce249d230d2f5b975c))
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
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* update debt swap test ([#621](https://github.com/cowprotocol/cow-sdk/issues/621)) ([5e0a66b](https://github.com/cowprotocol/cow-sdk/commit/5e0a66b2d7a8c34adf4dc50e3640f462a1e13188))
* update repay test ([#619](https://github.com/cowprotocol/cow-sdk/issues/619)) ([8c81142](https://github.com/cowprotocol/cow-sdk/commit/8c81142197e0b05c73ac7bf84cb9ccd022171d64))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-app-data bumped to 5.0.0
    * @cowprotocol/sdk-trading bumped to 2.0.0
    * @cowprotocol/sdk-order-signing bumped to 1.0.0
    * @cowprotocol/sdk-order-book bumped to 3.0.0
    * @cowprotocol/sdk-config bumped to 2.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0
</details>

<details><summary>sdk-order-book: 3.0.0</summary>

## [3.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-book-v2.0.1...sdk-order-book-v3.0.0) (2026-03-16)


###   BREAKING CHANGES

* **chains:** Remove support for Lens.
* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800))
* release cow-sdk v7

### ( Features

* add API endpoints for partners ([#809](https://github.com/cowprotocol/cow-sdk/issues/809)) ([59900e8](https://github.com/cowprotocol/cow-sdk/commit/59900e854a336e294ec881bd70bb13e579ff48ec))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* add offset & limit params to getTrades ([#713](https://github.com/cowprotocol/cow-sdk/issues/713)) ([3d3dde0](https://github.com/cowprotocol/cow-sdk/commit/3d3dde0a6d6b8e371fcba983c2bc06687bb6daeb))
* **chains:** Remove Lens ([#818](https://github.com/cowprotocol/cow-sdk/issues/818)) ([e8c74a0](https://github.com/cowprotocol/cow-sdk/commit/e8c74a078e5940901591652164af7b2ffb7b1fa6))
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


### = Bug Fixes

* avoid protocol fee double-count in sell quotes ([#719](https://github.com/cowprotocol/cow-sdk/issues/719)) ([ad5b372](https://github.com/cowprotocol/cow-sdk/commit/ad5b37219f0c6ad61b84a9327d03a9610c41bd4e))
* **order-book:** handle decimal protocolFeeBps BigInt conversion ([#798](https://github.com/cowprotocol/cow-sdk/issues/798)) ([ad7d323](https://github.com/cowprotocol/cow-sdk/commit/ad7d32370c8bb1a414cf1e23a2f2f89e1f9e0b96))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))
* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800)) ([ea96f67](https://github.com/cowprotocol/cow-sdk/commit/ea96f67a6ff44b7cc9226dc8ab7991896ced3ca7))


### =Ú Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

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
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-common bumped to 1.0.0
</details>

<details><summary>sdk-order-signing: 1.0.0</summary>

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-order-signing-v0.2.0...sdk-order-signing-v1.0.0) (2026-03-16)


###   BREAKING CHANGES

* release cow-sdk v7

### ( Features

* move order-signing to new package ([c60daab](https://github.com/cowprotocol/cow-sdk/commit/c60daabcd3e9311913f27b519561b7b992958cf4))
* refactor order-signing ([8e28d1b](https://github.com/cowprotocol/cow-sdk/commit/8e28d1bdbda9632347cacaae906298e736f4a7b3))
* refactor order-signing tests ([2d99282](https://github.com/cowprotocol/cow-sdk/commit/2d99282382da1545cd205cf246db0f055e7e0415))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* simplify OrderSigningUtils to use static methods only ([#417](https://github.com/cowprotocol/cow-sdk/issues/417)) ([899ca43](https://github.com/cowprotocol/cow-sdk/commit/899ca4325be831b6711468d1df3733d98fe913b0))
* update settlement and vault relayer contracts on staging ([#807](https://github.com/cowprotocol/cow-sdk/issues/807)) ([0f9a03e](https://github.com/cowprotocol/cow-sdk/commit/0f9a03e6bfa3468630e46735f7583618ae711b73))


### = Bug Fixes

* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))


### =Ú Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

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
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#637](https://github.com/cowprotocol/cow-sdk/issues/637)) ([6909e8d](https://github.com/cowprotocol/cow-sdk/commit/6909e8d5e97afadc203be2293865bfb2f9338953))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#650](https://github.com/cowprotocol/cow-sdk/issues/650)) ([2493612](https://github.com/cowprotocol/cow-sdk/commit/24936120e51b0083eda408ab80b8f8ee4115e223))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#702](https://github.com/cowprotocol/cow-sdk/issues/702)) ([1e6b54d](https://github.com/cowprotocol/cow-sdk/commit/1e6b54dbaef21a61c362bc2d1567d87f14d7f8a7))
* release main ([#718](https://github.com/cowprotocol/cow-sdk/issues/718)) ([87683ec](https://github.com/cowprotocol/cow-sdk/commit/87683ecc507e59d70a6d623faba83cda65ca44cc))
* release main ([#720](https://github.com/cowprotocol/cow-sdk/issues/720)) ([c7348b8](https://github.com/cowprotocol/cow-sdk/commit/c7348b8eeaddb371c82631dbf94bfd8b0fb0209b))
* release main ([#721](https://github.com/cowprotocol/cow-sdk/issues/721)) ([d8cb9ec](https://github.com/cowprotocol/cow-sdk/commit/d8cb9ec16d16af35f8c2a1387b82fee472acd380))
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#741](https://github.com/cowprotocol/cow-sdk/issues/741)) ([32fb8bb](https://github.com/cowprotocol/cow-sdk/commit/32fb8bbe6b1172c2666f330d0d50cdc2f7c2554f))
* release main ([#742](https://github.com/cowprotocol/cow-sdk/issues/742)) ([8c8d857](https://github.com/cowprotocol/cow-sdk/commit/8c8d857e9c9da59b8793f2f9dfb3ca075891e6e3))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#751](https://github.com/cowprotocol/cow-sdk/issues/751)) ([885d7f7](https://github.com/cowprotocol/cow-sdk/commit/885d7f707bf2074dfb80df6ebcf41c12515695e3))
* release main ([#754](https://github.com/cowprotocol/cow-sdk/issues/754)) ([3f2f53c](https://github.com/cowprotocol/cow-sdk/commit/3f2f53cdf66520d2f2c8fd82df2b614bc202eb6b))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#778](https://github.com/cowprotocol/cow-sdk/issues/778)) ([d84e4a3](https://github.com/cowprotocol/cow-sdk/commit/d84e4a3a5d918a6ba28879a20798510eb84cbf12))
* release main ([#779](https://github.com/cowprotocol/cow-sdk/issues/779)) ([6387df5](https://github.com/cowprotocol/cow-sdk/commit/6387df570750f4411ad57e3aed709b4eb848557c))
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
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 3.0.0
    * @cowprotocol/sdk-order-book bumped to 3.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0
</details>

<details><summary>sdk-subgraph: 2.0.0</summary>

## [2.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-subgraph-v1.0.1...sdk-subgraph-v2.0.0) (2026-03-16)


###   BREAKING CHANGES

* **chains:** Remove support for Lens.
* release cow-sdk v7

### ( Features

* **chains:** Remove Lens ([#818](https://github.com/cowprotocol/cow-sdk/issues/818)) ([e8c74a0](https://github.com/cowprotocol/cow-sdk/commit/e8c74a078e5940901591652164af7b2ffb7b1fa6))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* **subgraph:** refactor subgraph package ([84d6f26](https://github.com/cowprotocol/cow-sdk/commit/84d6f268f7e96b946797d4650bc0cee742afcb23))


### = Bug Fixes

* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))


### =Ú Documentation

* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

* **docs:** apply PR suggestions and create subgraph README ([#406](https://github.com/cowprotocol/cow-sdk/issues/406)) ([d09a219](https://github.com/cowprotocol/cow-sdk/commit/d09a219c934289a30677be685915d57e9a4451be))
* release main ([#453](https://github.com/cowprotocol/cow-sdk/issues/453)) ([36080c1](https://github.com/cowprotocol/cow-sdk/commit/36080c1955f5f161bebce7867af110f6938e5c95))
* release main ([#467](https://github.com/cowprotocol/cow-sdk/issues/467)) ([ed2977a](https://github.com/cowprotocol/cow-sdk/commit/ed2977a82bb2f4b43de900840848e33532d001f0))
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
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
* **subgraph:** create package, tsconfig and jest config ([0255736](https://github.com/cowprotocol/cow-sdk/commit/02557362739c27a9777540d73b15092f745814f7))
* **subgraph:** move subgraph to monorepo package ([017d146](https://github.com/cowprotocol/cow-sdk/commit/017d14673eeaacc255b438e69138c83c2d310b28))
* **subgraph:** update pnpm-lock and run lint ([3f8144b](https://github.com/cowprotocol/cow-sdk/commit/3f8144be4839f5596763a25d505524a7318ebcbc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-config bumped to 2.0.0
</details>

<details><summary>sdk-trading: 2.0.0</summary>

## [2.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-trading-v1.1.0...sdk-trading-v2.0.0) (2026-03-16)


###   BREAKING CHANGES

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800))
* release cow-sdk v7

### ( Features

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
* update settlement and vault relayer contracts on staging ([#807](https://github.com/cowprotocol/cow-sdk/issues/807)) ([0f9a03e](https://github.com/cowprotocol/cow-sdk/commit/0f9a03e6bfa3468630e46735f7583618ae711b73))


### = Bug Fixes

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


### =Ú Documentation

* add link to cancel order doc ([#580](https://github.com/cowprotocol/cow-sdk/issues/580)) ([9764178](https://github.com/cowprotocol/cow-sdk/commit/97641785500141c7e68a96483f17a624724b5386))
* update README to focus on main use cases ([#493](https://github.com/cowprotocol/cow-sdk/issues/493)) ([a05cb1b](https://github.com/cowprotocol/cow-sdk/commit/a05cb1ba11b5f9895d7cfe6262cf74c4089fd73c))


### =' Miscellaneous

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
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-app-data bumped to 5.0.0
    * @cowprotocol/sdk-order-book bumped to 3.0.0
    * @cowprotocol/sdk-order-signing bumped to 1.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 3.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0
</details>

<details><summary>sdk-viem-adapter: 1.0.0</summary>

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-viem-adapter-v0.3.12...sdk-viem-adapter-v1.0.0) (2026-03-16)


###   BREAKING CHANGES

* release cow-sdk v7

### ( Features

* add from/to fields for receipt ([#629](https://github.com/cowprotocol/cow-sdk/issues/629)) ([3dd3868](https://github.com/cowprotocol/cow-sdk/commit/3dd38682741ac93bfbd9b7d9a4fe79df7283dca0))
* add migration guide and wagmi example ([#498](https://github.com/cowprotocol/cow-sdk/issues/498)) ([21be05d](https://github.com/cowprotocol/cow-sdk/commit/21be05d5b6472de26120ebefe4626341af9a062d))
* add new order-signing features to adapters ([555d55f](https://github.com/cowprotocol/cow-sdk/commit/555d55ff353376c11deef498b76795d5e7dcabca))
* **bridge:** add NearIntents bridge provider ([#663](https://github.com/cowprotocol/cow-sdk/issues/663)) ([afd63bc](https://github.com/cowprotocol/cow-sdk/commit/afd63bce3765e2adc81b73357e233399111e3595))
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


### = Bug Fixes

* **cow-shed:** fix adapters - estimateGas  and encodeAbi ([76ab995](https://github.com/cowprotocol/cow-sdk/commit/76ab995635247e63213dafb50ff462334977cc6d))
* improve unknown/any types ([#443](https://github.com/cowprotocol/cow-sdk/issues/443)) ([e6b8a40](https://github.com/cowprotocol/cow-sdk/commit/e6b8a40578583cf6d1ecd208434782422f308ef0))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))
* viemUtils encodeAbi ([c5698dd](https://github.com/cowprotocol/cow-sdk/commit/c5698ddc14bbcd68e88440b50c40f4c927beccb7))


### =' Miscellaneous

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
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
</details>

<details><summary>sdk-weiroll: 1.0.0</summary>

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-weiroll-v0.1.23...sdk-weiroll-v1.0.0) (2026-03-16)


###   BREAKING CHANGES

* release cow-sdk v7

### ( Features

* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))


### = Bug Fixes

* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))


### =' Miscellaneous

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
* release main ([#575](https://github.com/cowprotocol/cow-sdk/issues/575)) ([2ef068b](https://github.com/cowprotocol/cow-sdk/commit/2ef068b851e5d114784f81ecbcd0fe3c512b7570))
* release main ([#605](https://github.com/cowprotocol/cow-sdk/issues/605)) ([c9efd22](https://github.com/cowprotocol/cow-sdk/commit/c9efd22e6c934e95cb0e88a684b3a973b7ac3cce))
* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* release main ([#635](https://github.com/cowprotocol/cow-sdk/issues/635)) ([bd5c1d9](https://github.com/cowprotocol/cow-sdk/commit/bd5c1d998c17379b2386942a0404ad4e0e232b4c))
* release main ([#648](https://github.com/cowprotocol/cow-sdk/issues/648)) ([5dd3bf5](https://github.com/cowprotocol/cow-sdk/commit/5dd3bf5659852590d5d46317bfc19c56e125ca59))
* release main ([#700](https://github.com/cowprotocol/cow-sdk/issues/700)) ([a0ce28d](https://github.com/cowprotocol/cow-sdk/commit/a0ce28d18e51b50e947bc104228686d558861391))
* release main ([#718](https://github.com/cowprotocol/cow-sdk/issues/718)) ([87683ec](https://github.com/cowprotocol/cow-sdk/commit/87683ecc507e59d70a6d623faba83cda65ca44cc))
* release main ([#727](https://github.com/cowprotocol/cow-sdk/issues/727)) ([af17e9a](https://github.com/cowprotocol/cow-sdk/commit/af17e9a772f608c5c2751bce25549062a38702b6))
* release main ([#730](https://github.com/cowprotocol/cow-sdk/issues/730)) ([e7e4157](https://github.com/cowprotocol/cow-sdk/commit/e7e415700724d6cc62f1f0590dbf47d908a9a55e))
* release main ([#735](https://github.com/cowprotocol/cow-sdk/issues/735)) ([c17655c](https://github.com/cowprotocol/cow-sdk/commit/c17655c588a735bd12c1219317f5b290cf9d9a34))
* release main ([#744](https://github.com/cowprotocol/cow-sdk/issues/744)) ([110c279](https://github.com/cowprotocol/cow-sdk/commit/110c279db08dd981c0bda2c6b7e8c08ea3c81325))
* release main ([#772](https://github.com/cowprotocol/cow-sdk/issues/772)) ([cd30d4f](https://github.com/cowprotocol/cow-sdk/commit/cd30d4fe42c4b2d1bbe592026a097d6b76edd735))
* release main ([#780](https://github.com/cowprotocol/cow-sdk/issues/780)) ([3fa1e95](https://github.com/cowprotocol/cow-sdk/commit/3fa1e951c248fb8c72c7b7a3cd2e96470e1582df))
* release main ([#784](https://github.com/cowprotocol/cow-sdk/issues/784)) ([8284aa4](https://github.com/cowprotocol/cow-sdk/commit/8284aa47954ab4880b6bd87b4b09f23656b264fd))
* release main ([#788](https://github.com/cowprotocol/cow-sdk/issues/788)) ([9d7eecb](https://github.com/cowprotocol/cow-sdk/commit/9d7eecb86b40c15ea2c368c02213e166ea9b6cd2))
* release main ([#790](https://github.com/cowprotocol/cow-sdk/issues/790)) ([4109197](https://github.com/cowprotocol/cow-sdk/commit/410919754c2f07e99a92787bf7b3c503ac34c9ea))
* release main ([#794](https://github.com/cowprotocol/cow-sdk/issues/794)) ([6f11dfd](https://github.com/cowprotocol/cow-sdk/commit/6f11dfdca4cecee7d036fc2ae49c886832db25bf))
* release main ([#802](https://github.com/cowprotocol/cow-sdk/issues/802)) ([5583ca4](https://github.com/cowprotocol/cow-sdk/commit/5583ca446f498416565b79485bcaf7708f1ba224))
* release main ([#805](https://github.com/cowprotocol/cow-sdk/issues/805)) ([adbc6a9](https://github.com/cowprotocol/cow-sdk/commit/adbc6a98eb15b02a87215a1bd446982553219b41))
* release main ([#811](https://github.com/cowprotocol/cow-sdk/issues/811)) ([816c990](https://github.com/cowprotocol/cow-sdk/commit/816c990e87a39a122c918d6748b2f254350c4be5))
* release main ([#812](https://github.com/cowprotocol/cow-sdk/issues/812)) ([4981e10](https://github.com/cowprotocol/cow-sdk/commit/4981e1060718f701ad3a6a096e71ef2e544f29fe))
* release main ([#819](https://github.com/cowprotocol/cow-sdk/issues/819)) ([5f7ecfb](https://github.com/cowprotocol/cow-sdk/commit/5f7ecfba74abc721b80c5fe6f4997f9518c40788))
* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 1.0.0
    * @cowprotocol/sdk-config bumped to 2.0.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 1.0.0
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).