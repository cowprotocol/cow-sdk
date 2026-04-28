# Changelog

## [4.0.3](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v4.0.2...sdk-bridging-v4.0.3) (2026-04-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 5.1.0
    * @cowprotocol/sdk-trading bumped to 2.0.3

## [4.0.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v4.0.1...sdk-bridging-v4.0.2) (2026-04-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-trading bumped to 2.0.2

## [4.0.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v4.0.0...sdk-bridging-v4.0.1) (2026-04-20)


### 🐛 Bug Fixes

* **bridge:** make sender optional in Bungee events response ([#865](https://github.com/cowprotocol/cow-sdk/issues/865)) ([b5eba89](https://github.com/cowprotocol/cow-sdk/commit/b5eba898a3173b5ca0a449f0e50d4b871da303c6))


### 📚 Documentation

* **bridge:** use real WETH addresses in README example ([#851](https://github.com/cowprotocol/cow-sdk/issues/851)) ([12c130a](https://github.com/cowprotocol/cow-sdk/commit/12c130a36d753db7bf3bc63c262f3c15adc19fd0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-contracts-ts bumped to 3.0.1
    * @cowprotocol/sdk-cow-shed bumped to 0.3.8
    * @cowprotocol/sdk-trading bumped to 2.0.1
  * devDependencies
    * @cowprotocol/sdk-order-signing bumped to 1.0.1

## [4.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.4.0...sdk-bridging-v4.0.0) (2026-04-16)


### ⚠ BREAKING CHANGES

* bring cow.fi back ([#863](https://github.com/cowprotocol/cow-sdk/issues/863))

### ✨ Features

* bring cow.fi back ([#863](https://github.com/cowprotocol/cow-sdk/issues/863)) ([d607fd2](https://github.com/cowprotocol/cow-sdk/commit/d607fd2cfbc93ace39de04f3a7870f723fdd9b21))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 5.0.0
    * @cowprotocol/sdk-common bumped to 0.10.2
    * @cowprotocol/sdk-config bumped to 2.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 3.0.0
    * @cowprotocol/sdk-cow-shed bumped to 0.3.7
    * @cowprotocol/sdk-order-book bumped to 3.0.0
    * @cowprotocol/sdk-trading bumped to 2.0.0
    * @cowprotocol/sdk-weiroll bumped to 0.1.30
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.4
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.4
    * @cowprotocol/sdk-order-signing bumped to 1.0.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.18

## [3.4.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.3.2...sdk-bridging-v3.4.0) (2026-04-14)


### ✨ Features

* migrate to cow.finance domain ([#860](https://github.com/cowprotocol/cow-sdk/issues/860)) ([a4e7633](https://github.com/cowprotocol/cow-sdk/commit/a4e76333b7a276baec5c977f44b15498550d8e50))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.7.0
    * @cowprotocol/sdk-common bumped to 0.10.1
    * @cowprotocol/sdk-config bumped to 1.2.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.5.0
    * @cowprotocol/sdk-cow-shed bumped to 0.3.6
    * @cowprotocol/sdk-order-book bumped to 2.1.0
    * @cowprotocol/sdk-trading bumped to 1.3.0
    * @cowprotocol/sdk-weiroll bumped to 0.1.29
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.3
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.3
    * @cowprotocol/sdk-order-signing bumped to 0.3.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.17

## [3.3.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.3.1...sdk-bridging-v3.3.2) (2026-04-08)


### 🐛 Bug Fixes

* use adaptToken if contract address is empty ([#850](https://github.com/cowprotocol/cow-sdk/issues/850)) ([d57c397](https://github.com/cowprotocol/cow-sdk/commit/d57c3972d9104fbf846e15a831d004d4e20b961f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.14
    * @cowprotocol/sdk-common bumped to 0.10.0
    * @cowprotocol/sdk-config bumped to 1.1.3
    * @cowprotocol/sdk-contracts-ts bumped to 2.4.0
    * @cowprotocol/sdk-cow-shed bumped to 0.3.5
    * @cowprotocol/sdk-order-book bumped to 2.0.5
    * @cowprotocol/sdk-trading bumped to 1.2.2
    * @cowprotocol/sdk-weiroll bumped to 0.1.28
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.2
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.2
    * @cowprotocol/sdk-order-signing bumped to 0.2.5
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.16

## [3.3.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.3.0...sdk-bridging-v3.3.1) (2026-04-07)


### 🐛 Bug Fixes

* **bridging:** retain metadata in appData for intermediate swap results ([#852](https://github.com/cowprotocol/cow-sdk/issues/852)) ([b72b656](https://github.com/cowprotocol/cow-sdk/commit/b72b6565640774b5eb6957dcbe08029331582e2f))

## [3.3.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.2.0...sdk-bridging-v3.3.0) (2026-04-01)


### ✨ Features

* add sol/btc supports for NEAR ([#844](https://github.com/cowprotocol/cow-sdk/issues/844)) ([9c4ea35](https://github.com/cowprotocol/cow-sdk/commit/9c4ea35eed827bb36eee216fa0a53ed8b44f1756))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.13
    * @cowprotocol/sdk-common bumped to 0.9.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.3.0
    * @cowprotocol/sdk-cow-shed bumped to 0.3.4
    * @cowprotocol/sdk-order-book bumped to 2.0.4
    * @cowprotocol/sdk-trading bumped to 1.2.1
    * @cowprotocol/sdk-weiroll bumped to 0.1.27
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.1
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.1
    * @cowprotocol/sdk-order-signing bumped to 0.2.4
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.15

## [3.2.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.1.2...sdk-bridging-v3.2.0) (2026-03-17)


### ✨ Features

* use address utils to compare addresses ([#827](https://github.com/cowprotocol/cow-sdk/issues/827)) ([50a66ff](https://github.com/cowprotocol/cow-sdk/commit/50a66ff044f98ce0313c6213e31c83c9028836a1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.12
    * @cowprotocol/sdk-contracts-ts bumped to 2.2.0
    * @cowprotocol/sdk-cow-shed bumped to 0.3.3
    * @cowprotocol/sdk-trading bumped to 1.2.0
    * @cowprotocol/sdk-weiroll bumped to 0.1.26
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.4.0
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.4.0
    * @cowprotocol/sdk-order-signing bumped to 0.2.3

## [3.1.2](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.1.1...sdk-bridging-v3.1.2) (2026-03-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.11
    * @cowprotocol/sdk-common bumped to 0.8.2
    * @cowprotocol/sdk-config bumped to 1.1.2
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.2
    * @cowprotocol/sdk-cow-shed bumped to 0.3.2
    * @cowprotocol/sdk-order-book bumped to 2.0.3
    * @cowprotocol/sdk-trading bumped to 1.1.2
    * @cowprotocol/sdk-weiroll bumped to 0.1.25
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.14
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.14
    * @cowprotocol/sdk-order-signing bumped to 0.2.2
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.14

## [3.1.1](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.1.0...sdk-bridging-v3.1.1) (2026-03-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.10
    * @cowprotocol/sdk-common bumped to 0.8.1
    * @cowprotocol/sdk-config bumped to 1.1.1
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.1
    * @cowprotocol/sdk-cow-shed bumped to 0.3.1
    * @cowprotocol/sdk-order-book bumped to 2.0.2
    * @cowprotocol/sdk-trading bumped to 1.1.1
    * @cowprotocol/sdk-weiroll bumped to 0.1.24
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.13
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.13
    * @cowprotocol/sdk-order-signing bumped to 0.2.1
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.13

## [3.1.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v3.0.0...sdk-bridging-v3.1.0) (2026-03-16)


### ✨ Features

* update settlement and vault relayer contracts on staging ([#807](https://github.com/cowprotocol/cow-sdk/issues/807)) ([0f9a03e](https://github.com/cowprotocol/cow-sdk/commit/0f9a03e6bfa3468630e46735f7583618ae711b73))


### 🔧 Miscellaneous

* release main ([#826](https://github.com/cowprotocol/cow-sdk/issues/826)) ([baaa708](https://github.com/cowprotocol/cow-sdk/commit/baaa7088ac15b89fb83310e54aa52f09d19132ff))
* release main ([#832](https://github.com/cowprotocol/cow-sdk/issues/832)) ([5dafcb8](https://github.com/cowprotocol/cow-sdk/commit/5dafcb8ec5593250dba1ff6e9fdbf8eb11d974cf))
* revert release ([#833](https://github.com/cowprotocol/cow-sdk/issues/833)) ([0c40a9b](https://github.com/cowprotocol/cow-sdk/commit/0c40a9b3ee828c7ede66576f02e1b571e96140cd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.9
    * @cowprotocol/sdk-common bumped to 0.8.0
    * @cowprotocol/sdk-config bumped to 1.1.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.1.0
    * @cowprotocol/sdk-cow-shed bumped to 0.3.0
    * @cowprotocol/sdk-order-book bumped to 2.0.1
    * @cowprotocol/sdk-trading bumped to 1.1.0
    * @cowprotocol/sdk-weiroll bumped to 0.1.23
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.12
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.12
    * @cowprotocol/sdk-order-signing bumped to 0.2.0
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.12

## [3.0.0](https://github.com/cowprotocol/cow-sdk/compare/sdk-bridging-v2.1.1...sdk-bridging-v3.0.0) (2026-03-10)


### ⚠ BREAKING CHANGES

* **chains:** Remove support for Lens.

### ✨ Features

* **chains:** Remove Lens ([#818](https://github.com/cowprotocol/cow-sdk/issues/818)) ([e8c74a0](https://github.com/cowprotocol/cow-sdk/commit/e8c74a078e5940901591652164af7b2ffb7b1fa6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/sdk-app-data bumped to 4.6.8
    * @cowprotocol/sdk-common bumped to 0.7.1
    * @cowprotocol/sdk-config bumped to 1.0.0
    * @cowprotocol/sdk-contracts-ts bumped to 2.0.0
    * @cowprotocol/sdk-cow-shed bumped to 0.2.22
    * @cowprotocol/sdk-order-book bumped to 2.0.0
    * @cowprotocol/sdk-trading bumped to 1.0.4
    * @cowprotocol/sdk-weiroll bumped to 0.1.22
  * devDependencies
    * @cowprotocol/sdk-ethers-v5-adapter bumped to 0.3.11
    * @cowprotocol/sdk-ethers-v6-adapter bumped to 0.3.11
    * @cowprotocol/sdk-order-signing bumped to 0.1.38
    * @cowprotocol/sdk-viem-adapter bumped to 0.3.11

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
