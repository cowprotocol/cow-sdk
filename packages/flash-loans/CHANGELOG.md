# Changelog

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
