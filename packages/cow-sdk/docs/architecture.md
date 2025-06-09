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

The SDK has 3 main APIs

- **Order Book API**: Allows to get the open orders, historic orders, post new orders, etc.
- **Subgraph API**: Provides access to on-chain data indexed by The Graph
- **Metadata API**: Allows to encode/decode meta-data to be attached in orders

## Model: Orders

The orders model used for the API is organized in a hierarchy:

```mermaid
classDiagram

OrderParameters  <|-- OrderCreation
OrderCreation  <|-- Order
OrderMetaData  <|-- Order
Order <|-- EnrichedOrder
```

## Model: Orders (details)

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
  + executedFee?: BigUint | null;
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

## Model: Trades

```mermaid
classDiagram


class Trades {
  + orderUid: UID
  + blockNumber: number
  + logIndex: number
  + sellAmountBeforeFees: BigUint
}

Trades --> Address: sellToken
Trades --> Address: buyToken
Trades --> Address: owner

Trades --> TokenAmount: sellAmount
Trades --> TokenAmount: buyAmount


Trades "0..1" --> TransactionHash: txHash
```

## Order Book API

Allows to get the open orders, historic orders, post new orders, etc.

- 📚 [Swagger - Api Docs](https://api.cow.fi/docs)
- 📚 [Dev Docs - API](https://docs.cow.fi/cow-sdk/cow-api)

The API allows to

```mermaid
classDiagram

class CowApi {
  + getTrades(params) Promise~Trades[]~
  + getOrders(parmas): Promise~EnrichedOrder[]~
  + getTxOrders(tx: string): Promise~EnrichedOrder[]~
  + getOrder(uid: UID): Promise~EnrichedOrder~
  + getQuote(quote: OrderQuoteRequest): Promise~OrderQuoteResponse~
  + sendSignedOrderCancellation(uid: UID, params): Promise~void~
  + sendOrder(order: OrderCreation): Promise~UID~
  + getOrderLink(uid: UID): string
}



class OrderQuoteRequest {
  + sellToken: Address;
  + buyToken: Address;
  // ...
}


class OrderQuoteResponse{
  + id?: number
  + from?: Address
  + expiration?: string
}

OrderQuoteResponse "0..1" --> OrderParameters: quote

CowApi ..> Trade
CowApi ..> EnrichedOrder
CowApi ..> SignedOrder
CowApi ..> OrderCreation
CowApi ..> OrderQuoteResponse
CowApi ..> OrderQuoteRequest
```

## API: Subgraph

Provides access to on-chain data indexed by The Graph

> ⚽️ [Playground](https://thegraph.com/hosted-service/subgraph/cowprotocol/cow)

> 📚 [Dev Docs - SubGraph](https://docs.cow.fi/cow-sdk/querying-the-cow-subgraph)

> 📄 [GitHub code](https://github.com/cowprotocol/subgraph)

**NOTE**: For details about the model, it's better to check the schema using the exported Typescript, or by reviewing the [schema definition](https://thegraph.com/hosted-service/subgraph/cowprotocol/cow).

```mermaid
classDiagram

class CowSubgraphApi {
  + getTotals(): Promise~Total~
  + getLastHoursVolume(): Promise~LastHoursVolumeQuery~
  + getLastDaysVolume(): Promise~LastDaysVolumeQuery~
  + runQuery(query, variables): Promise~T~
}

class Total {
  + volumeUsd
  + volumeEth
  + feesUsd
  + feesEth
  ...
}


class LastHoursVolumeQuery{
  volumeUsd: string
  ...
}

class LastDaysVolumeQuery{
  volumeUsd: string
  ...
}

CowSubgraphApi ..> Total
CowSubgraphApi ..> LastHoursVolumeQuery
CowSubgraphApi ..> LastDaysVolumeQuery

```

## API: Meta-data

Allows to encode/decode meta-data to be attached in orders

> 📚 [Dev Docs - Metadata](https://docs.cow.fi/cow-sdk/order-meta-data-appdata)

> 📄 [GitHub code](https://github.com/cowprotocol/app-data)

```mermaid
classDiagram

class MetadataApi {
  + generateAppDataDoc(params: GenerateAppDataDocParams): AppDataDoc
  + validateAppDataDoc(appDataDoc: AppDataDoc): ValidateResult
  + calculateAppDataHash(appDataDoc: AppDataDoc): Promise~IpfsHashInfo|void~
  + uploadMetadataDocToIpfs(appDataDoc: AppDataDoc, ipfsConfig): Promise~string|void~
  + decodeAppData(hash: string): AppDataDoc
  + appDataHexToCid(hash: string): Promise~string|void~
}

class AppDataDoc {
  version: Version;
  appCode?: string;
  environment?: string;
}

AppDataDoc --> Metadata: metadata

class Referrer {
  version: string;
  address: string;
}

class Quote {
  version: string;
  address: string;
}

class IpfsHashInfo {
  + cidV0: string
  + appDataHash: string
}

class OrderClass {
  version: string;
  orderClass: string;
}

class AppDataParams {
  ...
}


class Metadata {
  ...
}

class MetadataParams {
  ...
}


MetadataApi ..> IpfsHashInfo
MetadataApi ..> GenerateAppDataDocParams
MetadataApi ..> AppDataDoc

GenerateAppDataDocParams --> AppDataParams: appDataParams
GenerateAppDataDocParams --> MetadataParams: metadataParams



Metadata --> Referrer: referrer
Metadata --> Quote: quote
Metadata --> OrderClass: orderClass
```
