# Changelog

## [3.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v2.1.1...sdk-bridging-v3.0.0) (2026-03-10)


### ⚠ BREAKING CHANGES

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800))
* **bridge:** split swap and bridge slippages ([#750](https://github.com/cowprotocol/cow-sdk/issues/750))
* release cow-sdk v7

### ✨ Features

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
* implement protocol fee ([#689](https://github.com/cowprotocol/cow-sdk/issues/689)) ([ec5bdad](https://github.com/cowprotocol/cow-sdk/commit/ec5bdada1ebf17afd42a9c8cabd617cf8be79d50))
* improve order priority ([#745](https://github.com/cowprotocol/cow-sdk/issues/745)) ([1de00ba](https://github.com/cowprotocol/cow-sdk/commit/1de00ba5007d4e8ef78be73e7b47e99ece105ef0))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))
* **lib-agnostic:** migrate latest Bridging changes ([#426](https://github.com/cowprotocol/cow-sdk/issues/426)) ([2359d9b](https://github.com/cowprotocol/cow-sdk/commit/2359d9b903e80ae5bab0cdb92d8cf52ae250da36))
* **lib-agnostic:** migrate latest SDK changes ([#427](https://github.com/cowprotocol/cow-sdk/issues/427)) ([323bab6](https://github.com/cowprotocol/cow-sdk/commit/323bab61eb5adeb4a58bc15e25ffb29d2e1afcbf))
* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))
* release cow-sdk v7 ([6cd3e57](https://github.com/cowprotocol/cow-sdk/commit/6cd3e573687b1ffdbc0fdcb8cdbb414d88546e38))
* **sdk-agnostic-lib:** Create weiroll package ([#371](https://github.com/cowprotocol/cow-sdk/issues/371)) ([8f6a2e1](https://github.com/cowprotocol/cow-sdk/commit/8f6a2e16e5e7a43a5afc43cf5faab174be916b2e))
* use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([1b23c5e](https://github.com/cowprotocol/cow-sdk/commit/1b23c5e5f7e1763b710b95f444ad052395808277))
* use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([2a8e220](https://github.com/cowprotocol/cow-sdk/commit/2a8e2205acc5143efecbc9caee89d01f32570e0d))


### 🐛 Bug Fixes

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
    * @cowprotocol/sdk-order-book bumped to 2.0.0
    * @cowprotocol/sdk-trading bumped to 2.0.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 1.0.0

## [2.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v2.1.0...sdk-bridging-v2.1.1) (2026-03-10)


### 🐛 Bug Fixes

* **bridge:** increase extra gas for post hook ([#815](https://github.com/cowprotocol/cow-sdk/issues/815)) ([4e2330f](https://github.com/cowprotocol/cow-sdk/commit/4e2330f5af0613081b2be9a9c7c6ff0e93035f46))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 1.1.2
    * @cowprotocol/sdk-trading bumped to 1.0.3
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.37

## [2.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v2.0.1...sdk-bridging-v2.1.0) (2026-03-04)


### ✨ Features

* Add non-evm chains types & guards & address validators  ([#792](https://github.com/cowprotocol/cow-sdk/issues/792)) ([b4b6047](https://github.com/cowprotocol/cow-sdk/commit/b4b6047889190f668f6409aeee7079ba6095f9ae))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.7
    * @cowprotocol/sdk-common bumped to 0.7.0
    * @cowprotocol/sdk-config bumped to 0.10.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.8.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.21
    * @cowprotocol/sdk-order-book bumped to 1.1.1
    * @cowprotocol/sdk-trading bumped to 1.0.2
    * @cowprotocol/sdk-weiroll bumped to 0.1.21
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.10
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.10
    * @cowprotocol/sdk-order-signing bumped to 0.1.36
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.10

## [2.0.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v2.0.0...sdk-bridging-v2.0.1) (2026-03-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.6
    * @cowprotocol/sdk-common bumped to 0.6.3
    * @cowprotocol/sdk-config bumped to 0.9.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.7.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.20
    * @cowprotocol/sdk-order-book bumped to 1.1.0
    * @cowprotocol/sdk-trading bumped to 1.0.1
    * @cowprotocol/sdk-weiroll bumped to 0.1.20
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.9
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.9
    * @cowprotocol/sdk-order-signing bumped to 0.1.35
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.9

## [2.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.7.6...sdk-bridging-v2.0.0) (2026-02-26)


### ⚠ BREAKING CHANGES

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800))

### 🐛 Bug Fixes

* update quote amounts and costs structure ([#800](https://github.com/cowprotocol/cow-sdk/issues/800)) ([ea96f67](https://github.com/cowprotocol/cow-sdk/commit/ea96f67a6ff44b7cc9226dc8ab7991896ced3ca7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 1.0.0
    * @cowprotocol/sdk-trading bumped to 1.0.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.34

## [1.7.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.7.5...sdk-bridging-v1.7.6) (2026-02-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.5
    * @cowprotocol/sdk-common bumped to 0.6.2
    * @cowprotocol/sdk-config bumped to 0.8.1
    * @cowprotocol/sdk-contracts-ts bumped to 1.6.1
    * @cowprotocol/sdk-cow-shed bumped to 0.2.19
    * @cowprotocol/sdk-order-book bumped to 0.6.6
    * @cowprotocol/sdk-trading bumped to 0.11.1
    * @cowprotocol/sdk-weiroll bumped to 0.1.19
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.8
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.8
    * @cowprotocol/sdk-order-signing bumped to 0.1.33
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.8

## [1.7.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.7.4...sdk-bridging-v1.7.5) (2026-02-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.4
    * @cowprotocol/sdk-common bumped to 0.6.1
    * @cowprotocol/sdk-config bumped to 0.8.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.6.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.18
    * @cowprotocol/sdk-order-book bumped to 0.6.5
    * @cowprotocol/sdk-trading bumped to 0.11.0
    * @cowprotocol/sdk-weiroll bumped to 0.1.18
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.7
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.7
    * @cowprotocol/sdk-order-signing bumped to 0.1.32
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.7

## [1.7.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.7.3...sdk-bridging-v1.7.4) (2026-02-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.3
    * @cowprotocol/sdk-common bumped to 0.6.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.5.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.17
    * @cowprotocol/sdk-order-book bumped to 0.6.4
    * @cowprotocol/sdk-trading bumped to 0.10.1
    * @cowprotocol/sdk-weiroll bumped to 0.1.17
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.6
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.6
    * @cowprotocol/sdk-order-signing bumped to 0.1.31
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.6

## [1.7.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.7.2...sdk-bridging-v1.7.3) (2026-02-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.10.0

## [1.7.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.7.1...sdk-bridging-v1.7.2) (2026-02-02)


### 🔧 Miscellaneous

* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.2
    * @cowprotocol/sdk-common bumped to 0.5.4
    * @cowprotocol/sdk-config bumped to 0.7.3
    * @cowprotocol/sdk-contracts-ts bumped to 1.4.2
    * @cowprotocol/sdk-cow-shed bumped to 0.2.16
    * @cowprotocol/sdk-order-book bumped to 0.6.3
    * @cowprotocol/sdk-trading bumped to 0.9.4
    * @cowprotocol/sdk-weiroll bumped to 0.1.16
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.5
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.5
    * @cowprotocol/sdk-order-signing bumped to 0.1.30
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.5

## [1.7.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.7.0...sdk-bridging-v1.7.1) (2026-02-02)


### 🐛 Bug Fixes

* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.1
    * @cowprotocol/sdk-common bumped to 0.5.3
    * @cowprotocol/sdk-config bumped to 0.7.2
    * @cowprotocol/sdk-contracts-ts bumped to 1.4.1
    * @cowprotocol/sdk-cow-shed bumped to 0.2.15
    * @cowprotocol/sdk-order-book bumped to 0.6.2
    * @cowprotocol/sdk-trading bumped to 0.9.3
    * @cowprotocol/sdk-weiroll bumped to 0.1.15
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.4
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.29
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.4

## [1.7.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.6.0...sdk-bridging-v1.7.0) (2026-01-28)


### ✨ Features

* allow new code property in referrer schema ([#774](https://github.com/cowprotocol/cow-sdk/issues/774)) ([2b648b6](https://github.com/cowprotocol/cow-sdk/commit/2b648b6a1db03fd34002c49572d8e8e556d03593))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.0
    * @cowprotocol/sdk-common bumped to 0.5.2
    * @cowprotocol/sdk-config bumped to 0.7.1
    * @cowprotocol/sdk-contracts-ts bumped to 1.4.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.14
    * @cowprotocol/sdk-order-book bumped to 0.6.1
    * @cowprotocol/sdk-trading bumped to 0.9.2
    * @cowprotocol/sdk-weiroll bumped to 0.1.14
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.28
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.3

## [1.6.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.5.0...sdk-bridging-v1.6.0) (2026-01-28)


### ✨ Features

* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.5.2
    * @cowprotocol/sdk-common bumped to 0.5.1
    * @cowprotocol/sdk-config bumped to 0.7.0
    * @cowprotocol/sdk-contracts-ts bumped to 1.3.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.13
    * @cowprotocol/sdk-order-book bumped to 0.6.0
    * @cowprotocol/sdk-trading bumped to 0.9.1
    * @cowprotocol/sdk-weiroll bumped to 0.1.13
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.27
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.2

## [1.5.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.4.1...sdk-bridging-v1.5.0) (2026-01-22)


### ✨ Features

* **bridge:** add a flag to control intermediate=sell token ([#777](https://github.com/cowprotocol/cow-sdk/issues/777)) ([588dffa](https://github.com/cowprotocol/cow-sdk/commit/588dffaf418b8220293fe803186e3801597282d0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 1.2.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.12
    * @cowprotocol/sdk-trading bumped to 0.9.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.26

## [1.4.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.4.0...sdk-bridging-v1.4.1) (2026-01-21)


### 🐛 Bug Fixes

* add optional apiKey for NearIntentsBridgeProvider ([#775](https://github.com/cowprotocol/cow-sdk/issues/775)) ([7546a4c](https://github.com/cowprotocol/cow-sdk/commit/7546a4c75fe43b5ee8381a45eb6608d5e8593436))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 1.1.1
    * @cowprotocol/sdk-cow-shed bumped to 0.2.11
    * @cowprotocol/sdk-trading bumped to 0.8.2
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.25

## [1.4.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.3.0...sdk-bridging-v1.4.0) (2026-01-19)


### ✨ Features

* **bridge:** allow sell token as intermediate token ([#768](https://github.com/cowprotocol/cow-sdk/issues/768)) ([8c367ac](https://github.com/cowprotocol/cow-sdk/commit/8c367ac704ad10003618c8916e32529c5c9eb815))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.5.1
    * @cowprotocol/sdk-common bumped to 0.5.0
    * @cowprotocol/sdk-config bumped to 0.6.3
    * @cowprotocol/sdk-contracts-ts bumped to 1.1.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.10
    * @cowprotocol/sdk-order-book bumped to 0.5.1
    * @cowprotocol/sdk-trading bumped to 0.8.1
    * @cowprotocol/sdk-weiroll bumped to 0.1.12
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.24
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.1

## [1.3.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.2.0...sdk-bridging-v1.3.0) (2026-01-15)


### ✨ Features

* add plasma support for Near bridge provider ([#769](https://github.com/cowprotocol/cow-sdk/issues/769)) ([a3db993](https://github.com/cowprotocol/cow-sdk/commit/a3db993e9fedb54b87d7a2048c163c5fdaec7272))

## [1.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.1.2...sdk-bridging-v1.2.0) (2025-12-25)


### ✨ Features

* **bridge:** extend bridging appData with attestation data ([#756](https://github.com/cowprotocol/cow-sdk/issues/756)) ([ff04417](https://github.com/cowprotocol/cow-sdk/commit/ff044172bdfa2997393e2bf9a331119815d2fc12))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.5.0
    * @cowprotocol/sdk-trading bumped to 0.8.0

## [1.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.1.1...sdk-bridging-v1.1.2) (2025-12-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.7.4

## [1.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.1.0...sdk-bridging-v1.1.1) (2025-12-23)


### 🐛 Bug Fixes

* **bridge:** use swapSlippageBps for non-bridge swaps ([#757](https://github.com/cowprotocol/cow-sdk/issues/757)) ([5f86ea5](https://github.com/cowprotocol/cow-sdk/commit/5f86ea59904922e164b2ee97f64e1b1148f9a92e))

## [1.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v1.0.0...sdk-bridging-v1.1.0) (2025-12-22)


### ✨ Features

* improve order priority ([#745](https://github.com/cowprotocol/cow-sdk/issues/745)) ([1de00ba](https://github.com/cowprotocol/cow-sdk/commit/1de00ba5007d4e8ef78be73e7b47e99ece105ef0))


### 🐛 Bug Fixes

* **bridge:** filter providers when do MultiQuote ([#753](https://github.com/cowprotocol/cow-sdk/issues/753)) ([aa4aa96](https://github.com/cowprotocol/cow-sdk/commit/aa4aa961914436595ceb901602d5da09f1f54ae9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.4.0
    * @cowprotocol/sdk-order-book bumped to 0.5.0
    * @cowprotocol/sdk-trading bumped to 0.7.3
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.23

## [1.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.12.1...sdk-bridging-v1.0.0) (2025-12-19)


### ⚠ BREAKING CHANGES

* **bridge:** split swap and bridge slippages ([#750](https://github.com/cowprotocol/cow-sdk/issues/750))

### ✨ Features

* **bridge:** split swap and bridge slippages ([#750](https://github.com/cowprotocol/cow-sdk/issues/750)) ([3ae7b57](https://github.com/cowprotocol/cow-sdk/commit/3ae7b574d1215ae598ec0a519ec003a9f21b7a7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 1.0.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.9
    * @cowprotocol/sdk-trading bumped to 0.7.2
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.22

## [0.12.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.12.0...sdk-bridging-v0.12.1) (2025-12-17)


### 🐛 Bug Fixes

* bungee across bridge config ([#748](https://github.com/cowprotocol/cow-sdk/issues/748)) ([6219b05](https://github.com/cowprotocol/cow-sdk/commit/6219b05ebda268e71ce68fd06146545ff0a4f25c))

## [0.12.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.11.0...sdk-bridging-v0.12.0) (2025-12-11)


### ✨ Features

* add new SELL_AMOUNT_TOO_SMALL error and catch it in near provider ([#743](https://github.com/cowprotocol/cow-sdk/issues/743)) ([4e6c896](https://github.com/cowprotocol/cow-sdk/commit/4e6c8961d318cf4b45f145121eaf65ec30e91de0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.6
    * @cowprotocol/sdk-config bumped to 0.6.2
    * @cowprotocol/sdk-contracts-ts bumped to 0.8.1
    * @cowprotocol/sdk-cow-shed bumped to 0.2.8
    * @cowprotocol/sdk-order-book bumped to 0.4.4
    * @cowprotocol/sdk-trading bumped to 0.7.1
    * @cowprotocol/sdk-weiroll bumped to 0.1.11
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.21

## [0.11.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.10.1...sdk-bridging-v0.11.0) (2025-12-10)


### ✨ Features

* **bridge:** determine intermediate token ([#738](https://github.com/cowprotocol/cow-sdk/issues/738)) ([381e885](https://github.com/cowprotocol/cow-sdk/commit/381e885d398623cfd731b439e7e62e8b863736c8))


### 🔧 Miscellaneous

* release main ([#741](https://github.com/cowprotocol/cow-sdk/issues/741)) ([32fb8bb](https://github.com/cowprotocol/cow-sdk/commit/32fb8bbe6b1172c2666f330d0d50cdc2f7c2554f))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.8.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.7
    * @cowprotocol/sdk-trading bumped to 0.7.0
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.20

## [0.10.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.10.0...sdk-bridging-v0.10.1) (2025-12-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.5
    * @cowprotocol/sdk-config bumped to 0.6.1
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.4
    * @cowprotocol/sdk-cow-shed bumped to 0.2.6
    * @cowprotocol/sdk-order-book bumped to 0.4.3
    * @cowprotocol/sdk-trading bumped to 0.6.3
    * @cowprotocol/sdk-weiroll bumped to 0.1.10
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.19

## [0.10.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.9.0...sdk-bridging-v0.10.0) (2025-12-04)


### ✨ Features

* use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([1b23c5e](https://github.com/cowprotocol/cow-sdk/commit/1b23c5e5f7e1763b710b95f444ad052395808277))


### 🔧 Miscellaneous

* revert use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([f73bc96](https://github.com/cowprotocol/cow-sdk/commit/f73bc96156796ce4928f64f963295501dfc69a5c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.4
    * @cowprotocol/sdk-config bumped to 0.6.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.3
    * @cowprotocol/sdk-cow-shed bumped to 0.2.5
    * @cowprotocol/sdk-order-book bumped to 0.4.2
    * @cowprotocol/sdk-trading bumped to 0.6.2
    * @cowprotocol/sdk-weiroll bumped to 0.1.9
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.18

## [0.9.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.8.5...sdk-bridging-v0.9.0) (2025-12-03)


### ✨ Features

* use aws for token and chain images ([#724](https://github.com/cowprotocol/cow-sdk/issues/724)) ([2a8e220](https://github.com/cowprotocol/cow-sdk/commit/2a8e2205acc5143efecbc9caee89d01f32570e0d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.3
    * @cowprotocol/sdk-config bumped to 0.5.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.2
    * @cowprotocol/sdk-cow-shed bumped to 0.2.4
    * @cowprotocol/sdk-order-book bumped to 0.4.1
    * @cowprotocol/sdk-trading bumped to 0.6.1
    * @cowprotocol/sdk-weiroll bumped to 0.1.8
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.17

## [0.8.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.8.4...sdk-bridging-v0.8.5) (2025-12-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.2
    * @cowprotocol/sdk-trading bumped to 0.6.0

## [0.8.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.8.3...sdk-bridging-v0.8.4) (2025-12-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 0.4.0
    * @cowprotocol/sdk-trading bumped to 0.5.4
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.16

## [0.8.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.8.2...sdk-bridging-v0.8.3) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-order-book bumped to 0.3.2
    * @cowprotocol/sdk-trading bumped to 0.5.3
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.15

## [0.8.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.8.1...sdk-bridging-v0.8.2) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.1
    * @cowprotocol/sdk-config bumped to 0.4.1
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.1
    * @cowprotocol/sdk-cow-shed bumped to 0.2.3
    * @cowprotocol/sdk-order-book bumped to 0.3.1
    * @cowprotocol/sdk-trading bumped to 0.5.2
    * @cowprotocol/sdk-weiroll bumped to 0.1.7
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.14

## [0.8.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.8.0...sdk-bridging-v0.8.1) (2025-11-27)


### 🐛 Bug Fixes

* **bridge:** capture surplus in Near intents ([#714](https://github.com/cowprotocol/cow-sdk/issues/714)) ([b74ebc8](https://github.com/cowprotocol/cow-sdk/commit/b74ebc8a0c730f9254f81b3cff64695894ed193e))

## [0.8.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.7.0...sdk-bridging-v0.8.0) (2025-11-24)


### ✨ Features

* **bridge:** add quote id and signature metadata ([#701](https://github.com/cowprotocol/cow-sdk/issues/701)) ([35a25a7](https://github.com/cowprotocol/cow-sdk/commit/35a25a7fcc2724073355b3dba4b8f6d3b7419032))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.7.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.2
    * @cowprotocol/sdk-trading bumped to 0.5.1
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.13

## [0.7.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.6.1...sdk-bridging-v0.7.0) (2025-11-24)


### ✨ Features

* **bridge:** add NearIntents bridge provider ([#663](https://github.com/cowprotocol/cow-sdk/issues/663)) ([afd63bc](https://github.com/cowprotocol/cow-sdk/commit/afd63bce3765e2adc81b73357e233399111e3595))
* **bridge:** support Near bridge provider ([#642](https://github.com/cowprotocol/cow-sdk/issues/642)) ([c7d8633](https://github.com/cowprotocol/cow-sdk/commit/c7d86335601cfd772d72dfe65a0e941ce916769a))
* implement protocol fee ([#689](https://github.com/cowprotocol/cow-sdk/issues/689)) ([ec5bdad](https://github.com/cowprotocol/cow-sdk/commit/ec5bdada1ebf17afd42a9c8cabd617cf8be79d50))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.2.0
    * @cowprotocol/sdk-common bumped to 0.4.0
    * @cowprotocol/sdk-config bumped to 0.4.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.6.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.1
    * @cowprotocol/sdk-order-book bumped to 0.3.0
    * @cowprotocol/sdk-trading bumped to 0.5.0
    * @cowprotocol/sdk-weiroll bumped to 0.1.6
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.12
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0

## [0.6.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.6.0...sdk-bridging-v0.6.1) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.5.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.0
    * @cowprotocol/sdk-trading bumped to 0.4.6
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.11

## [0.6.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.5.2...sdk-bridging-v0.6.0) (2025-11-05)


### ✨ Features

* **new-chains:** add q4 chains ([#606](https://github.com/cowprotocol/cow-sdk/issues/606)) ([2501382](https://github.com/cowprotocol/cow-sdk/commit/2501382e80acb7f6bb0f87adbb5a9325de2c56cc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.6
    * @cowprotocol/sdk-config bumped to 0.3.0
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.4
    * @cowprotocol/sdk-cow-shed bumped to 0.1.10
    * @cowprotocol/sdk-order-book bumped to 0.2.0
    * @cowprotocol/sdk-trading bumped to 0.4.5
    * @cowprotocol/sdk-weiroll bumped to 0.1.5
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.10

## [0.5.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.5.1...sdk-bridging-v0.5.2) (2025-10-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 0.4.3
    * @cowprotocol/sdk-cow-shed bumped to 0.1.9
    * @cowprotocol/sdk-trading bumped to 0.4.4
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 0.1.9

## [0.5.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v0.5.0...sdk-bridging-v0.5.1) (2025-10-29)


### 🔧 Miscellaneous

* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))


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
