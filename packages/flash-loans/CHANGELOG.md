# Changelog

## [1.8.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.11...sdk-flash-loans-v1.8.0) (2026-03-10)


### ✨ Features

* allow aave sdk to provide the helper addresses in the construct… ([#666](https://github.com/cowprotocol/cow-sdk/issues/666)) ([828ae7d](https://github.com/cowprotocol/cow-sdk/commit/828ae7d120a06b9d550c9f7c1e52bb86f783d0b8))
* **flash-loans:** add dappId to aave hooks ([#645](https://github.com/cowprotocol/cow-sdk/issues/645)) ([b5312af](https://github.com/cowprotocol/cow-sdk/commit/b5312af11d2b164c125aa899a56ee0b1645ba18f))
* **flash-loans:** support debtSwap and repayCollateral ([#616](https://github.com/cowprotocol/cow-sdk/issues/616)) ([cdd9f8a](https://github.com/cowprotocol/cow-sdk/commit/cdd9f8a3fdc73be56d727f0ec320c2f11516f778))
* **flash-loans:** support flexible gasLimit options ([#736](https://github.com/cowprotocol/cow-sdk/issues/736)) ([14cbb36](https://github.com/cowprotocol/cow-sdk/commit/14cbb362a68462dddc028d5f5852f038f349daa3))
* **flash-loans:** support Mainnet, Gnosis, and Base for AAVE ([#657](https://github.com/cowprotocol/cow-sdk/issues/657)) ([c7f2327](https://github.com/cowprotocol/cow-sdk/commit/c7f2327f4672a899c2775dd8ab8d3543ad08cdd6))
* **flash-loans:** update smartcontract addresses ([#676](https://github.com/cowprotocol/cow-sdk/issues/676)) ([3d78116](https://github.com/cowprotocol/cow-sdk/commit/3d781167dfe6a02646c546b481f058d2ed0f664f))
* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))


### 🐛 Bug Fixes

* fix lint issues ([#631](https://github.com/cowprotocol/cow-sdk/issues/631)) ([2152be4](https://github.com/cowprotocol/cow-sdk/commit/2152be4f75017f033ca7eba0959d82691cef6ee3))
* **flash-loans:** add hooksGasLimit parameter ([#691](https://github.com/cowprotocol/cow-sdk/issues/691)) ([32ebb2b](https://github.com/cowprotocol/cow-sdk/commit/32ebb2b2ae1a27e31b3ccc141ccf7ec610db2ed6))
* flashloan fee calculation now matches aave's ([#622](https://github.com/cowprotocol/cow-sdk/issues/622)) ([8d11b7f](https://github.com/cowprotocol/cow-sdk/commit/8d11b7fbbc8ff797253f26772a0e5c940286f2d9))
* make adapters hook helpers public ([#639](https://github.com/cowprotocol/cow-sdk/issues/639)) ([f8760ae](https://github.com/cowprotocol/cow-sdk/commit/f8760ae6084f7df729f140f9bea799566c217287))
* pump flashloans sdk version ([#687](https://github.com/cowprotocol/cow-sdk/issues/687)) ([d31fb42](https://github.com/cowprotocol/cow-sdk/commit/d31fb421424ed3df81de09b0e2d36b7023466931))
* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))
* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))


### 🔧 Miscellaneous

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
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))
* update debt swap test ([#621](https://github.com/cowprotocol/cow-sdk/issues/621)) ([5e0a66b](https://github.com/cowprotocol/cow-sdk/commit/5e0a66b2d7a8c34adf4dc50e3640f462a1e13188))
* update repay test ([#619](https://github.com/cowprotocol/cow-sdk/issues/619)) ([8c81142](https://github.com/cowprotocol/cow-sdk/commit/8c81142197e0b05c73ac7bf84cb9ccd022171d64))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 2.0.0
    * @cowprotocol/sdk-order-signing bumped to 1.0.0
    * @cowprotocol/sdk-order-book bumped to 2.0.0

## [1.7.11](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.10...sdk-flash-loans-v1.7.11) (2026-03-10)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 1.0.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.37
    * @cowprotocol/sdk-order-book bumped to 1.1.2

## [1.7.10](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.9...sdk-flash-loans-v1.7.10) (2026-03-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.7.0
    * @cowprotocol/sdk-app-data bumped to 4.6.7
    * @cowprotocol/sdk-trading bumped to 1.0.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.36
    * @cowprotocol/sdk-order-book bumped to 1.1.1
    * @cowprotocol/sdk-config bumped to 0.10.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.10
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.10
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.10

## [1.7.9](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.8...sdk-flash-loans-v1.7.9) (2026-03-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.3
    * @cowprotocol/sdk-app-data bumped to 4.6.6
    * @cowprotocol/sdk-trading bumped to 1.0.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.35
    * @cowprotocol/sdk-order-book bumped to 1.1.0
    * @cowprotocol/sdk-config bumped to 0.9.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.9
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.9
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.9

## [1.7.8](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.7...sdk-flash-loans-v1.7.8) (2026-02-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 1.0.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.34
    * @cowprotocol/sdk-order-book bumped to 1.0.0

## [1.7.7](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.6...sdk-flash-loans-v1.7.7) (2026-02-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.2
    * @cowprotocol/sdk-app-data bumped to 4.6.5
    * @cowprotocol/sdk-trading bumped to 0.11.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.33
    * @cowprotocol/sdk-order-book bumped to 0.6.6
    * @cowprotocol/sdk-config bumped to 0.8.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.8
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.8
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.8

## [1.7.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.5...sdk-flash-loans-v1.7.6) (2026-02-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.1
    * @cowprotocol/sdk-app-data bumped to 4.6.4
    * @cowprotocol/sdk-trading bumped to 0.11.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.32
    * @cowprotocol/sdk-order-book bumped to 0.6.5
    * @cowprotocol/sdk-config bumped to 0.8.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.7
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.7
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.7

## [1.7.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.4...sdk-flash-loans-v1.7.5) (2026-02-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.6.0
    * @cowprotocol/sdk-app-data bumped to 4.6.3
    * @cowprotocol/sdk-trading bumped to 0.10.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.31
    * @cowprotocol/sdk-order-book bumped to 0.6.4
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.6
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.6
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.6

## [1.7.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.3...sdk-flash-loans-v1.7.4) (2026-02-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.10.0

## [1.7.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.2...sdk-flash-loans-v1.7.3) (2026-02-02)


### 🔧 Miscellaneous

* revert revert Ink network ([#789](https://github.com/cowprotocol/cow-sdk/issues/789)) ([a00dbbd](https://github.com/cowprotocol/cow-sdk/commit/a00dbbd6a26238bcee2d4452487d16551560c59f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.4
    * @cowprotocol/sdk-app-data bumped to 4.6.2
    * @cowprotocol/sdk-trading bumped to 0.9.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.30
    * @cowprotocol/sdk-order-book bumped to 0.6.3
    * @cowprotocol/sdk-config bumped to 0.7.3
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.5
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.5
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.5

## [1.7.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.1...sdk-flash-loans-v1.7.2) (2026-02-02)


### 🐛 Bug Fixes

* support decimals in protocolFeeBps ([#787](https://github.com/cowprotocol/cow-sdk/issues/787)) ([f53ae65](https://github.com/cowprotocol/cow-sdk/commit/f53ae65931d85e354779767ed67e0e4df944a2bc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.3
    * @cowprotocol/sdk-app-data bumped to 4.6.1
    * @cowprotocol/sdk-trading bumped to 0.9.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.29
    * @cowprotocol/sdk-order-book bumped to 0.6.2
    * @cowprotocol/sdk-config bumped to 0.7.2
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.4
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.4
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.4

## [1.7.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.7.0...sdk-flash-loans-v1.7.1) (2026-01-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.2
    * @cowprotocol/sdk-app-data bumped to 4.6.0
    * @cowprotocol/sdk-trading bumped to 0.9.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.28
    * @cowprotocol/sdk-order-book bumped to 0.6.1
    * @cowprotocol/sdk-config bumped to 0.7.1
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.3

## [1.7.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.6.8...sdk-flash-loans-v1.7.0) (2026-01-28)


### ✨ Features

* **ink:** reapply "feat/COW-163: Add Ink network ([#781](https://github.com/cowprotocol/cow-sdk/issues/781))" ([7c23332](https://github.com/cowprotocol/cow-sdk/commit/7c23332dac4f8c91d5f75ae68297906e20f20362))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.1
    * @cowprotocol/sdk-app-data bumped to 4.5.2
    * @cowprotocol/sdk-trading bumped to 0.9.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.27
    * @cowprotocol/sdk-order-book bumped to 0.6.0
    * @cowprotocol/sdk-config bumped to 0.7.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.2

## [1.6.8](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.6.7...sdk-flash-loans-v1.6.8) (2026-01-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.9.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.26

## [1.6.7](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.6.6...sdk-flash-loans-v1.6.7) (2026-01-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.8.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.25

## [1.6.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.6.5...sdk-flash-loans-v1.6.6) (2026-01-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.5.0
    * @cowprotocol/sdk-app-data bumped to 4.5.1
    * @cowprotocol/sdk-trading bumped to 0.8.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.24
    * @cowprotocol/sdk-order-book bumped to 0.5.1
    * @cowprotocol/sdk-config bumped to 0.6.3
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.1

## [1.6.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.6.4...sdk-flash-loans-v1.6.5) (2025-12-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.5.0
    * @cowprotocol/sdk-trading bumped to 0.8.0

## [1.6.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.6.3...sdk-flash-loans-v1.6.4) (2025-12-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.7.4

## [1.6.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.6.2...sdk-flash-loans-v1.6.3) (2025-12-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.4.0
    * @cowprotocol/sdk-trading bumped to 0.7.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.23
    * @cowprotocol/sdk-order-book bumped to 0.5.0

## [1.6.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.6.1...sdk-flash-loans-v1.6.2) (2025-12-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.7.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.22

## [1.6.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.6.0...sdk-flash-loans-v1.6.1) (2025-12-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.6
    * @cowprotocol/sdk-trading bumped to 0.7.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.21
    * @cowprotocol/sdk-order-book bumped to 0.4.4
    * @cowprotocol/sdk-config bumped to 0.6.2

## [1.6.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.12...sdk-flash-loans-v1.6.0) (2025-12-10)


### ✨ Features

* **flash-loans:** support flexible gasLimit options ([#736](https://github.com/cowprotocol/cow-sdk/issues/736)) ([14cbb36](https://github.com/cowprotocol/cow-sdk/commit/14cbb362a68462dddc028d5f5852f038f349daa3))


### 🔧 Miscellaneous

* release main ([#741](https://github.com/cowprotocol/cow-sdk/issues/741)) ([32fb8bb](https://github.com/cowprotocol/cow-sdk/commit/32fb8bbe6b1172c2666f330d0d50cdc2f7c2554f))
* revert not published release ([5facf05](https://github.com/cowprotocol/cow-sdk/commit/5facf05c67121404b7b5aa1e77950961b06eca81))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.7.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.20

## [1.5.12](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.11...sdk-flash-loans-v1.5.12) (2025-12-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.5
    * @cowprotocol/sdk-trading bumped to 0.6.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.19
    * @cowprotocol/sdk-order-book bumped to 0.4.3
    * @cowprotocol/sdk-config bumped to 0.6.1

## [1.5.11](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.10...sdk-flash-loans-v1.5.11) (2025-12-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.4
    * @cowprotocol/sdk-trading bumped to 0.6.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.18
    * @cowprotocol/sdk-order-book bumped to 0.4.2
    * @cowprotocol/sdk-config bumped to 0.6.0

## [1.5.10](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.9...sdk-flash-loans-v1.5.10) (2025-12-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.3
    * @cowprotocol/sdk-trading bumped to 0.6.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.17
    * @cowprotocol/sdk-order-book bumped to 0.4.1
    * @cowprotocol/sdk-config bumped to 0.5.0

## [1.5.9](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.8...sdk-flash-loans-v1.5.9) (2025-12-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.2
    * @cowprotocol/sdk-trading bumped to 0.6.0

## [1.5.8](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.7...sdk-flash-loans-v1.5.8) (2025-12-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.5.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.16
    * @cowprotocol/sdk-order-book bumped to 0.4.0

## [1.5.7](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.6...sdk-flash-loans-v1.5.7) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.5.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.15
    * @cowprotocol/sdk-order-book bumped to 0.3.2

## [1.5.6](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.5...sdk-flash-loans-v1.5.6) (2025-11-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.1
    * @cowprotocol/sdk-trading bumped to 0.5.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.14
    * @cowprotocol/sdk-order-book bumped to 0.3.1
    * @cowprotocol/sdk-config bumped to 0.4.1

## [1.5.5](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.4...sdk-flash-loans-v1.5.5) (2025-11-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.3.0
    * @cowprotocol/sdk-trading bumped to 0.5.1
    * @cowprotocol/sdk-order-signing bumped to 0.1.13

## [1.5.4](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.3...sdk-flash-loans-v1.5.4) (2025-11-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.4.0
    * @cowprotocol/sdk-app-data bumped to 4.2.0
    * @cowprotocol/sdk-trading bumped to 0.5.0
    * @cowprotocol/sdk-order-signing bumped to 0.1.12
    * @cowprotocol/sdk-order-book bumped to 0.3.0
    * @cowprotocol/sdk-config bumped to 0.4.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.0

## [1.5.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.2...sdk-flash-loans-v1.5.3) (2025-11-20)


### 🐛 Bug Fixes

* **flash-loans:** add hooksGasLimit parameter ([#691](https://github.com/cowprotocol/cow-sdk/issues/691)) ([32ebb2b](https://github.com/cowprotocol/cow-sdk/commit/32ebb2b2ae1a27e31b3ccc141ccf7ec610db2ed6))

## [1.5.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.1...sdk-flash-loans-v1.5.2) (2025-11-17)


### 🐛 Bug Fixes

* pump flashloans sdk version ([#687](https://github.com/cowprotocol/cow-sdk/issues/687)) ([d31fb42](https://github.com/cowprotocol/cow-sdk/commit/d31fb421424ed3df81de09b0e2d36b7023466931))

## [1.5.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.5.0...sdk-flash-loans-v1.5.1) (2025-11-17)


### 🔧 Miscellaneous

* allow to set the factory contract and aave pools in the sdk ([#680](https://github.com/cowprotocol/cow-sdk/issues/680)) ([b90529c](https://github.com/cowprotocol/cow-sdk/commit/b90529cd27fdeb4060bc0a53702df6f8104495b7))

## [1.5.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.4.0...sdk-flash-loans-v1.5.0) (2025-11-13)


### ✨ Features

* **flash-loans:** update smartcontract addresses ([#676](https://github.com/cowprotocol/cow-sdk/issues/676)) ([3d78116](https://github.com/cowprotocol/cow-sdk/commit/3d781167dfe6a02646c546b481f058d2ed0f664f))

## [1.4.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.3.0...sdk-flash-loans-v1.4.0) (2025-11-12)


### ✨ Features

* allow aave sdk to provide the helper addresses in the construct… ([#666](https://github.com/cowprotocol/cow-sdk/issues/666)) ([828ae7d](https://github.com/cowprotocol/cow-sdk/commit/828ae7d120a06b9d550c9f7c1e52bb86f783d0b8))

## [1.3.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.2.1...sdk-flash-loans-v1.3.0) (2025-11-07)


### ✨ Features

* **flash-loans:** support Mainnet, Gnosis, and Base for AAVE ([#657](https://github.com/cowprotocol/cow-sdk/issues/657)) ([c7f2327](https://github.com/cowprotocol/cow-sdk/commit/c7f2327f4672a899c2775dd8ab8d3543ad08cdd6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.4.6
    * @cowprotocol/sdk-order-signing bumped to 0.1.11

## [1.2.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.2.0...sdk-flash-loans-v1.2.1) (2025-11-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.1.6
    * @cowprotocol/sdk-trading bumped to 0.4.5
    * @cowprotocol/sdk-order-signing bumped to 0.1.10
    * @cowprotocol/sdk-order-book bumped to 0.2.0
    * @cowprotocol/sdk-config bumped to 0.3.0

## [1.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.1.3...sdk-flash-loans-v1.2.0) (2025-11-05)


### ✨ Features

* **flash-loans:** add dappId to aave hooks ([#645](https://github.com/cowprotocol/cow-sdk/issues/645)) ([b5312af](https://github.com/cowprotocol/cow-sdk/commit/b5312af11d2b164c125aa899a56ee0b1645ba18f))

## [1.1.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.1.2...sdk-flash-loans-v1.1.3) (2025-11-04)


### 🐛 Bug Fixes

* make adapters hook helpers public ([#639](https://github.com/cowprotocol/cow-sdk/issues/639)) ([f8760ae](https://github.com/cowprotocol/cow-sdk/commit/f8760ae6084f7df729f140f9bea799566c217287))

## [1.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.1.1...sdk-flash-loans-v1.1.2) (2025-10-30)


### 🐛 Bug Fixes

* flashloan fee calculation now matches aave's ([#622](https://github.com/cowprotocol/cow-sdk/issues/622)) ([8d11b7f](https://github.com/cowprotocol/cow-sdk/commit/8d11b7fbbc8ff797253f26772a0e5c940286f2d9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 0.4.4
    * @cowprotocol/sdk-order-signing bumped to 0.1.9

## [1.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.1.0...sdk-flash-loans-v1.1.1) (2025-10-29)


### 🐛 Bug Fixes

* fix lint issues ([#631](https://github.com/cowprotocol/cow-sdk/issues/631)) ([2152be4](https://github.com/cowprotocol/cow-sdk/commit/2152be4f75017f033ca7eba0959d82691cef6ee3))


### 🔧 Miscellaneous

* release main ([#620](https://github.com/cowprotocol/cow-sdk/issues/620)) ([b36394a](https://github.com/cowprotocol/cow-sdk/commit/b36394a2ba38957edb47ffc4451ea6624d66737b))
* revert release ([#634](https://github.com/cowprotocol/cow-sdk/issues/634)) ([fc7bf61](https://github.com/cowprotocol/cow-sdk/commit/fc7bf61444619d4b2c3a3dd55b7ce52c197b1878))
* update debt swap test ([#621](https://github.com/cowprotocol/cow-sdk/issues/621)) ([5e0a66b](https://github.com/cowprotocol/cow-sdk/commit/5e0a66b2d7a8c34adf4dc50e3640f462a1e13188))
* update repay test ([#619](https://github.com/cowprotocol/cow-sdk/issues/619)) ([8c81142](https://github.com/cowprotocol/cow-sdk/commit/8c81142197e0b05c73ac7bf84cb9ccd022171d64))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.3.0
    * @cowprotocol/sdk-app-data bumped to 4.1.5
    * @cowprotocol/sdk-trading bumped to 0.4.3
    * @cowprotocol/sdk-order-signing bumped to 0.1.8
    * @cowprotocol/sdk-order-book bumped to 0.1.4
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.2.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.2.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.2.0

## [1.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-flash-loans-v1.0.0...sdk-flash-loans-v1.1.0) (2025-10-24)


### ✨ Features

* **flash-loans:** support debtSwap and repayCollateral ([#616](https://github.com/cowprotocol/cow-sdk/issues/616)) ([cdd9f8a](https://github.com/cowprotocol/cow-sdk/commit/cdd9f8a3fdc73be56d727f0ec320c2f11516f778))

## 1.0.0 (2025-10-24)


### ✨ Features

* allow changing backoff and limiter per request ([#208](https://github.com/cowprotocol/cow-sdk/issues/208)) ([ebea5ca](https://github.com/cowprotocol/cow-sdk/commit/ebea5ca0858aeb89ae3e5d5407c8903c3ca5178d))


### 🐛 Bug Fixes

* **trading:** add EIP1271 signature support ([#584](https://github.com/cowprotocol/cow-sdk/issues/584)) ([ca9e834](https://github.com/cowprotocol/cow-sdk/commit/ca9e834e2b0edf8a757e01383b2218d5ecfbe25e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-common bumped to 0.2.2
    * @cowprotocol/sdk-app-data bumped to 4.1.4
    * @cowprotocol/sdk-trading bumped to 0.4.2
    * @cowprotocol/sdk-order-signing bumped to 0.1.7
    * @cowprotocol/sdk-order-book bumped to 0.1.3
    * @cowprotocol/sdk-config bumped to 0.2.0
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.1.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.1.3
    * @cowprotocol/sdk-viem-adapter bumped to 0.1.3
