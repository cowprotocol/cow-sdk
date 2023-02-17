# Architecture

```mermaid
flowchart LR

SDK[cow-sdk]
OrderBookApi
SubgraphApi
MetadataApi

SDK --> OrderBookApi
SDK --> SubgraphApi
SDK --> MetadataApi
```

The SDK has 3 main interfaces

- **Order Book API**: Provides access to the OrAPI
  - 📚 [Swagger - Api Docs](https://api.cow.fi/docs)
  - 📚 [Dev Docs - API](https://docs.cow.fi/cow-sdk/cow-api)
- **Subgraph API**: Provides access to On-chain data indexed by The Graph
  - ⚽️ [Playground](https://thegraph.com/hosted-service/subgraph/cowprotocol/cow)
  - 📚 [Dev Docs - SubGraph](https://docs.cow.fi/cow-sdk/querying-the-cow-subgraph)
  - 📄 [Github code](https://github.com/cowprotocol/subgraph)
- **Metadata API**: Allows to encode/decode meta-data to be attached in orders
  - 📚 [Dev Docs - Metadata](https://docs.cow.fi/cow-sdk/order-meta-data-appdata)
  - 📄 [Github code](https://github.com/cowprotocol/app-data)

## Model: Orders

The orders model used for the API is organized in a hierachy

- **OrderParameters\*\***: TODO
- **OrderCreation**: TODO
- **OrderMetaData**: TODO
- **Order**: TODO
- **EnrichedOrder**: TODO

```mermaid
classDiagram

OrderParameters  <|-- OrderCreation
OrderCreation  <|-- Order
OrderMetaData  <|-- Order
Order <|-- EnrichedOrder
```

## Model: Orders (details)

<style>
    .important {
        stroke-width: 3;
        stoke: #eeff82;
        fill: #eeff82
    }

     
     .important > rect {
        stroke-width: 3;
        stoke: #eeff82;
        fill: #eeff82
    }
</style>

```mermaid
classDiagram


class OrderParameters {
  + sellAmount: TokenAmount;
  + buyAmount: TokenAmount;
  + validTo: number;
  + feeAmount: TokenAmount;
  + kind: OrderKind;
  + partiallyFillable: boolean;
}

Address

class SellTokenSource {
  <<enum>>
  ERC20 = 'erc20'
  INTERNAL = 'internal'
  EXTERNAL = 'external'
}

class BuyTokenDestination{
  <<enum>>
  ERC20 = 'erc20',
  INTERNAL = 'internal',
}


class SigningScheme{
  <<enum>>
  EIP712 = 'eip712',
  ETHSIGN = 'ethsign',
  PRESIGN = 'presign',
  EIP1271 = 'eip1271',
}

class AppData {
  string
}

class OrderKind {
  <<enum>>
  BUY = 'buy'
  SELL = 'sell'
}

OrderParameters --> Address: sellToken
OrderParameters --> Address: buyToken
OrderParameters --> OrderKind: kind
OrderParameters "0..1" --> SellTokenSource: sellTokenBalance
OrderParameters "0..1" --> BuyTokenDestination: buyTokenBalance
OrderParameters --> SigningScheme: signingScheme
OrderParameters "0..1" --> Address: receiver
OrderParameters --> AppData: appData


class OrderCreation {
  + signingScheme: SigningScheme;
  + signature: Signature
  + from?: Address | null
  + quoteId?: number | null
}

class OrderMetaData {
  + creationDate: string;
  + uid: UID;
  + invalidated: boolean;

  + availableBalance?: TokenAmount | null;
  + executedSellAmount: BigUint;
  + executedSellAmountBeforeFees: BigUint;
  + executedBuyAmount: BigUint;
  + executedFeeAmount: BigUint;
  + fullFeeAmount?: TokenAmount;
  + isLiquidityOrder?: boolean;
  + onchainUser?: Address;
  + executedSurplusFee?: BigUint | null;
}

class OrderStatus {
  <<enum>>
  PRESIGNATURE_PENDING = 'presignaturePending'
  OPEN = 'open'
  FULFILLED = 'fulfilled'
  CANCELLED = 'cancelled'
  EXPIRED = 'expired'
}

class EthflowData {
  + refundTxHash: TransactionHash | null;
  + userValidTo: number;
  + isRefunded: boolean;
}

OrderMetaData --> OrderStatus: status
OrderMetaData --> OrderClass: class
OrderMetaData --> Address2: owner
OrderMetaData "0..1" --> EthflowData: ethflowData
OrderMetaData "0..1" --> OnchainOrderData: onchainOrderData

class OrderClass {
  <<enum>>
  MARKET = 'market'
  LIMIT = 'limit'
  LIQUIDITY = 'liquidity'
}


class EnrichedOrder{
  totalFee: string
}


OrderParameters  <|-- OrderCreation
OrderCreation  <|-- Order
OrderMetaData  <|-- Order
Order <|-- EnrichedOrder


cssClass "OrderParameters,OrderCreation,OrderMetaData, Order" important
```

## Order Book API

- 📚 [Swagger - Api Docs](https://api.cow.fi/docs)
- 📚 [Dev Docs - API](https://docs.cow.fi/cow-sdk/cow-api)

The API allows to

```mermaid
classDiagram

class CowApi {
  + getTrades() Trades
  + getOrders()
  + getTxOrders()
  + getOrder()
  + getQuote()
  + sendSignedOrderCancellation()
  + sendOrder()
  + getOrderLink()
}

CowApi ..> Trades
CowApi ..> Orders
CowApi ..> Quote
CowApi ..> SignedOrder

class CowSubgraphApi {
  + getLastHoursVolume()
  + getLastDaysVolume()
  + runQuery()
}

class MetadataApi {
  + generateAppDataDoc()
  + calculateAppDataHash()
  + uploadMetadataDocToIpfs()
  + decodeAppData()
  + appDataHexToCid()
  + getAppDataSchema()
  + validateAppDataDoc()
}

CowApi --> EnvConfig
CowSubgraphApi --> EnvConfig
MetadataApi --> EnvConfig
```

## API: Subgraph

> ⚽️ [Playground](https://thegraph.com/hosted-service/subgraph/cowprotocol/cow)

> 📚 [Dev Docs - SubGraph](https://docs.cow.fi/cow-sdk/querying-the-cow-subgraph)

> 📄 [Github code](https://github.com/cowprotocol/subgraph)

```mermaid
classDiagram

class CowSubgraphApi {
  + getLastHoursVolume()
  + getLastDaysVolume()
  + runQuery()
}
```

## API: Meta-data

> 📚 [Dev Docs - Metadata](https://docs.cow.fi/cow-sdk/order-meta-data-appdata)

> 📄 [Github code](https://github.com/cowprotocol/app-data)

```mermaid
classDiagram

class MetadataApi {
  + generateAppDataDoc()
  + calculateAppDataHash()
  + uploadMetadataDocToIpfs()
  + decodeAppData()
  + appDataHexToCid()
  + getAppDataSchema()
  + validateAppDataDoc()
}
```
