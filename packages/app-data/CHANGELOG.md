# Changelog

## [7.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v6.0.0...sdk-app-data-v7.0.0) (2026-08-03)


### ⚠ BREAKING CHANGES

* bring cow.fi back ([#863](https://github.com/cowprotocol/cow-sdk/issues/863))
* release cow-sdk v7

### ✨ Features

* allow new code property in referrer schema ([#774](https://github.com/cowprotocol/cow-sdk/issues/774)) ([2b648b6](https://github.com/cowprotocol/cow-sdk/commit/2b648b6a1db03fd34002c49572d8e8e556d03593))
* **app-data:** add `wrappers` to app-data ([#746](https://github.com/cowprotocol/cow-sdk/issues/746)) ([6d1868a](https://github.com/cowprotocol/cow-sdk/commit/6d1868a7430a33caa46caa7bf41465e42ecd5a8f))
* **app-data:** add user terms consents ([#763](https://github.com/cowprotocol/cow-sdk/issues/763)) ([1fc0b26](https://github.com/cowprotocol/cow-sdk/commit/1fc0b26ba250505db19c9189dd52a5e021c9616e))
* **app-data:** rename MetadataApi to AppDataSdk ([#893](https://github.com/cowprotocol/cow-sdk/issues/893)) ([9c4567f](https://github.com/cowprotocol/cow-sdk/commit/9c4567fc8d46baec47101afd540dee7d635d6237))
* **app-data:** update flashloan schema to 0.2.0 ([#572](https://github.com/cowprotocol/cow-sdk/issues/572)) ([e909dbd](https://github.com/cowprotocol/cow-sdk/commit/e909dbd059077fa80c52c9651b4ae2b6f6edd97c))
* **bridge:** add quote id and signature metadata ([#701](https://github.com/cowprotocol/cow-sdk/issues/701)) ([35a25a7](https://github.com/cowprotocol/cow-sdk/commit/35a25a7fcc2724073355b3dba4b8f6d3b7419032))
* **bridge:** extend bridging appData with attestation data ([#756](https://github.com/cowprotocol/cow-sdk/issues/756)) ([ff04417](https://github.com/cowprotocol/cow-sdk/commit/ff044172bdfa2997393e2bf9a331119815d2fc12))
* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))
* bring cow.fi back ([#863](https://github.com/cowprotocol/cow-sdk/issues/863)) ([d607fd2](https://github.com/cowprotocol/cow-sdk/commit/d607fd2cfbc93ace39de04f3a7870f723fdd9b21))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* migrate to cow.finance domain ([#860](https://github.com/cowprotocol/cow-sdk/issues/860)) ([a4e7633](https://github.com/cowprotocol/cow-sdk/commit/a4e76333b7a276baec5c977f44b15498550d8e50))
* **monorepo-config:** adjust all package.json and scripts ([23dc2a5](https://github.com/cowprotocol/cow-sdk/commit/23dc2a5db02ce3734b55e1151c8579f9a42a4bc5))
* per-package test coverage badges, updated in CI ([#895](https://github.com/cowprotocol/cow-sdk/issues/895)) ([c73246c](https://github.com/cowprotocol/cow-sdk/commit/c73246cc52c4fc79b2628b7c5f580695fd3dc1e2))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** create app data package ([#327](https://github.com/cowprotocol/cow-sdk/issues/327)) ([8b61261](https://github.com/cowprotocol/cow-sdk/commit/8b612615bc280dee2e5f4767794bc03f590d4764))
* **sdk-agnostic-lib:** create cow trading package ([#368](https://github.com/cowprotocol/cow-sdk/issues/368)) ([0a4534a](https://github.com/cowprotocol/cow-sdk/commit/0a4534aababce4f5d8bab991cd6ae9f51842d719))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* update ipfsOnlyHash deps ([#869](https://github.com/cowprotocol/cow-sdk/issues/869)) ([d6b30cf](https://github.com/cowprotocol/cow-sdk/commit/d6b30cfc248cb7d93f9b00113da7412b45b58194))


### 🐛 Bug Fixes

* app data cid lazy import ([#883](https://github.com/cowprotocol/cow-sdk/issues/883)) ([fd0235b](https://github.com/cowprotocol/cow-sdk/commit/fd0235b63e957ce268ce0c93626e45a396cea06e))
* **app-data:** bump maxVolumeBps cap ([#896](https://github.com/cowprotocol/cow-sdk/issues/896)) ([1e98a71](https://github.com/cowprotocol/cow-sdk/commit/1e98a71dbccc75c13dd185bb8d75b8f92f6ecc8f))
* **app-data:** fix typos and ids in schemas ([#586](https://github.com/cowprotocol/cow-sdk/issues/586)) ([5a4461a](https://github.com/cowprotocol/cow-sdk/commit/5a4461a2a171689db04f7c805c9e2c835bbd36dd))
* **app-data:** remove dappId validation ([#591](https://github.com/cowprotocol/cow-sdk/issues/591)) ([9db80c3](https://github.com/cowprotocol/cow-sdk/commit/9db80c34923c6b12ed9ecb3ed26ca1a99acd2b8f))
* **app-data:** rename `is_omittable` property as camelCase in appData ([6b16d0d](https://github.com/cowprotocol/cow-sdk/commit/6b16d0dab7831035651529169c572df79e79640d))
* **app-data:** rename `is_omittable` property in wrappers app data ([bb5c637](https://github.com/cowprotocol/cow-sdk/commit/bb5c6375135937389974916267fee850666fa2dd))
* **lib-agnostic:** add setProvider() method to adapters ([#432](https://github.com/cowprotocol/cow-sdk/issues/432)) ([64c0ea9](https://github.com/cowprotocol/cow-sdk/commit/64c0ea94d802aa167b978ae0859353d801de0911))
* near-bridging ([#908](https://github.com/cowprotocol/cow-sdk/issues/908)) ([b4d471c](https://github.com/cowprotocol/cow-sdk/commit/b4d471c8ebc7646d00bd6f6fd097b0692ac08f40))
* **sdk:** reduce sdks in umbrella ([#433](https://github.com/cowprotocol/cow-sdk/issues/433)) ([22b1cb6](https://github.com/cowprotocol/cow-sdk/commit/22b1cb6e572fcd3a7b3878d725113ac420f470e6))


### 📚 Documentation

* **app-data:** updated readme ([#725](https://github.com/cowprotocol/cow-sdk/issues/725)) ([c86fb55](https://github.com/cowprotocol/cow-sdk/commit/c86fb55f0a97b50da935da24e1f57796b86b4325))
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
* release main ([#832](https://github.com/cowprotocol/cow-sdk/issues/832)) ([5dafcb8](https://github.com/cowprotocol/cow-sdk/commit/5dafcb8ec5593250dba1ff6e9fdbf8eb11d974cf))
* release main ([#836](https://github.com/cowprotocol/cow-sdk/issues/836)) ([a7e1af9](https://github.com/cowprotocol/cow-sdk/commit/a7e1af993f501e313fb90573148b3d2d42e5168a))
* release main ([#840](https://github.com/cowprotocol/cow-sdk/issues/840)) ([1a22c69](https://github.com/cowprotocol/cow-sdk/commit/1a22c69592e283bb1a15ece9799a5b6f8c446765))
* release main ([#842](https://github.com/cowprotocol/cow-sdk/issues/842)) ([c4c238d](https://github.com/cowprotocol/cow-sdk/commit/c4c238d990d2089a66f9d8dc7401cd71b63d394b))
* release main ([#843](https://github.com/cowprotocol/cow-sdk/issues/843)) ([7b41c2d](https://github.com/cowprotocol/cow-sdk/commit/7b41c2ddcea33a49f519d7c816ad32cf2d6f9757))
* release main ([#848](https://github.com/cowprotocol/cow-sdk/issues/848)) ([a56dead](https://github.com/cowprotocol/cow-sdk/commit/a56dead934dd2d7d72583d996ea9f61e6091534b))
* release main ([#857](https://github.com/cowprotocol/cow-sdk/issues/857)) ([17fcfc5](https://github.com/cowprotocol/cow-sdk/commit/17fcfc590be8529dc4fe05b1c472fef1b07b47f4))
* release main ([#861](https://github.com/cowprotocol/cow-sdk/issues/861)) ([c178e68](https://github.com/cowprotocol/cow-sdk/commit/c178e68beaf46bb33b1ad2ec97212eec62172816))
* release main ([#864](https://github.com/cowprotocol/cow-sdk/issues/864)) ([a5207e0](https://github.com/cowprotocol/cow-sdk/commit/a5207e0dba212942ecf5564c8d01c9c75c77f647))
* release main ([#870](https://github.com/cowprotocol/cow-sdk/issues/870)) ([00c3dbd](https://github.com/cowprotocol/cow-sdk/commit/00c3dbd41c086ff9a51d5e5a30648615d4c66d0d))
* release main ([#880](https://github.com/cowprotocol/cow-sdk/issues/880)) ([447b5e1](https://github.com/cowprotocol/cow-sdk/commit/447b5e17b36a800a5f6fe6e4f890d2d77d017495))
* release main ([#886](https://github.com/cowprotocol/cow-sdk/issues/886)) ([5115efe](https://github.com/cowprotocol/cow-sdk/commit/5115efeb6f6f591c5eae653c63c5c5930eb24331))
* release main ([#887](https://github.com/cowprotocol/cow-sdk/issues/887)) ([74393ee](https://github.com/cowprotocol/cow-sdk/commit/74393ee2923a2932584998169daca6ce3c2da60c))
* release main ([#889](https://github.com/cowprotocol/cow-sdk/issues/889)) ([8659102](https://github.com/cowprotocol/cow-sdk/commit/865910213586d59f709c8e34726f799503bdfafb))
* release main ([#894](https://github.com/cowprotocol/cow-sdk/issues/894)) ([6ca7944](https://github.com/cowprotocol/cow-sdk/commit/6ca794476e3411ab5a3774d6cd88804b9f875d29))
* release main ([#900](https://github.com/cowprotocol/cow-sdk/issues/900)) ([3fdbda2](https://github.com/cowprotocol/cow-sdk/commit/3fdbda2042db284c73e3b16b90961e1c31a475cd))
* release main ([#909](https://github.com/cowprotocol/cow-sdk/issues/909)) ([f33e891](https://github.com/cowprotocol/cow-sdk/commit/f33e8914b207c0dead5ae4649e6e7f4d0ede7240))
* release main ([#934](https://github.com/cowprotocol/cow-sdk/issues/934)) ([2fc2da7](https://github.com/cowprotocol/cow-sdk/commit/2fc2da71c66fcbb4a9ea0d09aa264feadb71a86e))
* release main ([#951](https://github.com/cowprotocol/cow-sdk/issues/951)) ([3610c15](https://github.com/cowprotocol/cow-sdk/commit/3610c15b635fe6e622424776ccd209c9c6319c48))
* release main ([#952](https://github.com/cowprotocol/cow-sdk/issues/952)) ([6b4d3bb](https://github.com/cowprotocol/cow-sdk/commit/6b4d3bb8d93b2f09c4e701c3e0e297da141be01d))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert release ([#833](https://github.com/cowprotocol/cow-sdk/issues/833)) ([0c40a9b](https://github.com/cowprotocol/cow-sdk/commit/0c40a9b3ee828c7ede66576f02e1b571e96140cd))
* **sdk-agnostic-lib:** improve scripts and types ([#407](https://github.com/cowprotocol/cow-sdk/issues/407)) ([c4b5e08](https://github.com/cowprotocol/cow-sdk/commit/c4b5e086ce46086e9430d5f03ed330502349fbf3))
* **sdk-agnostic-lib:** merge multiple PRs to avoid conflicts and speed up base branch sync ([#354](https://github.com/cowprotocol/cow-sdk/issues/354)) ([55d3068](https://github.com/cowprotocol/cow-sdk/commit/55d3068c52217dd2618d8c180ab4fed8c9334c72))
* update coverage badges ([#903](https://github.com/cowprotocol/cow-sdk/issues/903)) ([c9e4b94](https://github.com/cowprotocol/cow-sdk/commit/c9e4b94fa77c364dfd1df5c61b67326c023e4731))

## [6.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.3.3...sdk-app-data-v6.0.0) (2026-08-03)


### ⚠ BREAKING CHANGES

* **app-data:** remove `AppDataSdk.legacy` methods ([#946](https://github.com/cowprotocol/cow-sdk/issues/946)) ([46a21b2](https://github.com/cowprotocol/cow-sdk/commit/46a21b2420883e4fc40b686c76d6a65f27467211))


## [5.3.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.3.2...sdk-app-data-v5.3.3) (2026-07-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.12.1
  * devDependencies
    * @cowprotocol/sdk-config bumped to 2.4.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.11
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.11
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.26

## [5.3.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.3.1...sdk-app-data-v5.3.2) (2026-07-22)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.25

## [5.3.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.3.0...sdk-app-data-v5.3.1) (2026-06-23)


### 🐛 Bug Fixes

* near-bridging ([#908](https://github.com/cowprotocol/cow-sdk/issues/908)) ([b4d471c](https://github.com/cowprotocol/cow-sdk/commit/b4d471c8ebc7646d00bd6f6fd097b0692ac08f40))

## [5.3.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.2.0...sdk-app-data-v5.3.0) (2026-06-15)


### ✨ Features

* per-package test coverage badges, updated in CI ([#895](https://github.com/cowprotocol/cow-sdk/issues/895)) ([c73246c](https://github.com/cowprotocol/cow-sdk/commit/c73246cc52c4fc79b2628b7c5f580695fd3dc1e2))


### 🔧 Miscellaneous

* update coverage badges ([#903](https://github.com/cowprotocol/cow-sdk/issues/903)) ([c9e4b94](https://github.com/cowprotocol/cow-sdk/commit/c9e4b94fa77c364dfd1df5c61b67326c023e4731))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.12.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 2.3.1
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.10
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.10
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.24

## [5.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.1.4...sdk-app-data-v5.2.0) (2026-06-08)


### ✨ Features

* **app-data:** rename MetadataApi to AppDataSdk ([#893](https://github.com/cowprotocol/cow-sdk/issues/893)) ([9c4567f](https://github.com/cowprotocol/cow-sdk/commit/9c4567fc8d46baec47101afd540dee7d635d6237))


### 🐛 Bug Fixes

* **app-data:** bump maxVolumeBps cap ([#896](https://github.com/cowprotocol/cow-sdk/issues/896)) ([1e98a71](https://github.com/cowprotocol/cow-sdk/commit/1e98a71dbccc75c13dd185bb8d75b8f92f6ecc8f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.11.2
  * devDependencies
    * @cowprotocol/sdk-config bumped to 2.3.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.9
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.9
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.23

## [5.1.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.1.3...sdk-app-data-v5.1.4) (2026-06-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.11.1
  * devDependencies
    * @cowprotocol/sdk-config bumped to 2.2.1
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.8
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.8
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.22

## [5.1.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.1.2...sdk-app-data-v5.1.3) (2026-05-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.11.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 2.2.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.7
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.7
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.21

## [5.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.1.1...sdk-app-data-v5.1.2) (2026-05-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.10.3
  * devDependencies
    * @cowprotocol/sdk-config bumped to 2.1.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.6
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.6
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.20

## [5.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.1.0...sdk-app-data-v5.1.1) (2026-05-20)


### 🐛 Bug Fixes

* app data cid lazy import ([#883](https://github.com/cowprotocol/cow-sdk/issues/883)) ([fd0235b](https://github.com/cowprotocol/cow-sdk/commit/fd0235b63e957ce268ce0c93626e45a396cea06e))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.5
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.5
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.19

## [5.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v5.0.0...sdk-app-data-v5.1.0) (2026-04-28)


### ✨ Features

* update ipfsOnlyHash deps ([#869](https://github.com/cowprotocol/cow-sdk/issues/869)) ([d6b30cf](https://github.com/cowprotocol/cow-sdk/commit/d6b30cfc248cb7d93f9b00113da7412b45b58194))

## [5.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.7.0...sdk-app-data-v5.0.0) (2026-04-16)


### ⚠ BREAKING CHANGES

* bring cow.fi back ([#863](https://github.com/cowprotocol/cow-sdk/issues/863))

### ✨ Features

* bring cow.fi back ([#863](https://github.com/cowprotocol/cow-sdk/issues/863)) ([d607fd2](https://github.com/cowprotocol/cow-sdk/commit/d607fd2cfbc93ace39de04f3a7870f723fdd9b21))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.10.2
  * devDependencies
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.4
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.4
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.18

## [4.7.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.14...sdk-app-data-v4.7.0) (2026-04-14)


### ✨ Features

* migrate to cow.finance domain ([#860](https://github.com/cowprotocol/cow-sdk/issues/860)) ([a4e7633](https://github.com/cowprotocol/cow-sdk/commit/a4e76333b7a276baec5c977f44b15498550d8e50))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.10.1
  * devDependencies
    * @cowprotocol/sdk-config bumped to 1.2.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.17

## [4.6.14](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.13...sdk-app-data-v4.6.14) (2026-04-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.10.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 1.1.3
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.16

## [4.6.13](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.12...sdk-app-data-v4.6.13) (2026-04-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.9.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.15

## [4.6.12](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.11...sdk-app-data-v4.6.12) (2026-03-17)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.0

## [4.6.11](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.10...sdk-app-data-v4.6.11) (2026-03-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.8.2
  * devDependencies
    * @cowprotocol/sdk-config bumped to 1.1.2
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.14
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.14
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.14

## [4.6.10](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.9...sdk-app-data-v4.6.10) (2026-03-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.8.1
  * devDependencies
    * @cowprotocol/sdk-config bumped to 1.1.1
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.13
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.13
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.13

## [4.6.9](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.8...sdk-app-data-v4.6.9) (2026-03-16)


### 🔧 Miscellaneous

* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* release main ([#832](https://github.com/cowprotocol/cow-sdk/issues/832)) ([5dafcb8](https://github.com/cowprotocol/cow-sdk/commit/5dafcb8ec5593250dba1ff6e9fdbf8eb11d974cf))
* revert release ([#833](https://github.com/cowprotocol/cow-sdk/issues/833)) ([0c40a9b](https://github.com/cowprotocol/cow-sdk/commit/0c40a9b3ee828c7ede66576f02e1b571e96140cd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.8.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 1.1.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.12
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.12
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.12

## [4.6.8](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.7...sdk-app-data-v4.6.8) (2026-03-10)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.7.1
  * devDependencies
    * @cowprotocol/sdk-config bumped to 1.0.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.11
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.11
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.11

## [4.6.7](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.6...sdk-app-data-v4.6.7) (2026-03-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.7.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.10.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.10
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.10
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.10

## [4.6.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.5...sdk-app-data-v4.6.6) (2026-03-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.3
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.9.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.9
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.9
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.9

## [4.6.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.4...sdk-app-data-v4.6.5) (2026-02-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.2
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.8.1
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.8
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.8
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.8

## [4.6.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.3...sdk-app-data-v4.6.4) (2026-02-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.1
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.8.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.7
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.7
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.7

## [4.6.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.2...sdk-app-data-v4.6.3) (2026-02-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.6
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.6
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.6

## [4.6.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.1...sdk-app-data-v4.6.2) (2026-02-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.4
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.7.3
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.5
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.5
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.5

## [4.6.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.6.0...sdk-app-data-v4.6.1) (2026-02-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.3
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.7.2
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.4
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.4
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.4

## [4.6.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.5.2...sdk-app-data-v4.6.0) (2026-01-28)


### ✨ Features

* allow new code property in referrer schema ([#774](https://github.com/cowprotocol/cow-sdk/issues/774)) ([2b648b6](https://github.com/cowprotocol/cow-sdk/commit/2b648b6a1db03fd34002c49572d8e8e556d03593))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.2
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.7.1
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.3

## [4.5.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.5.1...sdk-app-data-v4.5.2) (2026-01-28)


### 🐛 Bug Fixes

* **app-data:** rename `is_omittable` property as camelCase in appData ([6b16d0d](https://github.com/cowprotocol/cow-sdk/commit/6b16d0dab7831035651529169c572df79e79640d))
* **app-data:** rename `is_omittable` property in wrappers app data ([bb5c637](https://github.com/cowprotocol/cow-sdk/commit/bb5c6375135937389974916267fee850666fa2dd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.1
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.7.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.2

## [4.5.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.5.0...sdk-app-data-v4.5.1) (2026-01-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.6.3
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.1

## [4.5.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.4.0...sdk-app-data-v4.5.0) (2025-12-25)


### ✨ Features

* **app-data:** add user terms consents ([#763](https://github.com/cowprotocol/cow-sdk/issues/763)) ([1fc0b26](https://github.com/cowprotocol/cow-sdk/commit/1fc0b26ba250505db19c9189dd52a5e021c9616e))
* **bridge:** extend bridging appData with attestation data ([#756](https://github.com/cowprotocol/cow-sdk/issues/756)) ([ff04417](https://github.com/cowprotocol/cow-sdk/commit/ff044172bdfa2997393e2bf9a331119815d2fc12))

## [4.4.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.3.6...sdk-app-data-v4.4.0) (2025-12-22)


### ✨ Features

* **app-data:** add `wrappers` to app-data ([#746](https://github.com/cowprotocol/cow-sdk/issues/746)) ([6d1868a](https://github.com/cowprotocol/cow-sdk/commit/6d1868a7430a33caa46caa7bf41465e42ecd5a8f))

## [4.3.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.3.5...sdk-app-data-v4.3.6) (2025-12-11)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.6.2

## [4.3.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.3.4...sdk-app-data-v4.3.5) (2025-12-05)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.6.1

## [4.3.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.3.3...sdk-app-data-v4.3.4) (2025-12-04)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.6.0

## [4.3.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.3.2...sdk-app-data-v4.3.3) (2025-12-03)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.5.0

## [4.3.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.3.1...sdk-app-data-v4.3.2) (2025-12-03)


### 📚 Documentation

* **app-data:** updated readme ([#725](https://github.com/cowprotocol/cow-sdk/issues/725)) ([c86fb55](https://github.com/cowprotocol/cow-sdk/commit/c86fb55f0a97b50da935da24e1f57796b86b4325))

## [4.3.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.3.0...sdk-app-data-v4.3.1) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.4.1

## [4.3.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.2.0...sdk-app-data-v4.3.0) (2025-11-24)


### ✨ Features

* **bridge:** add quote id and signature metadata ([#701](https://github.com/cowprotocol/cow-sdk/issues/701)) ([35a25a7](https://github.com/cowprotocol/cow-sdk/commit/35a25a7fcc2724073355b3dba4b8f6d3b7419032))

## [4.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.6...sdk-app-data-v4.2.0) (2025-11-24)


### ✨ Features

* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.4.0
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.4.0
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0

## [4.1.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.5...sdk-app-data-v4.1.6) (2025-11-05)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @cowprotocol/sdk-config bumped to 0.3.0

## [4.1.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-app-data-v4.1.4...sdk-app-data-v4.1.5) (2025-10-29)


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
