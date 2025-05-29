/* tslint:disable */
/* eslint-disable */

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  Int8: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type Bundle = {
  __typename?: 'Bundle';
  /** Price of ETH in usd */
  ethPriceUSD: Scalars['BigDecimal']['output'];
  /** Singleton #1 */
  id: Scalars['ID']['output'];
};

export type Bundle_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>;
  ethPriceUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  ethPriceUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  ethPriceUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  ethPriceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  ethPriceUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  ethPriceUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  ethPriceUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  ethPriceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>;
};

export enum Bundle_OrderBy {
  EthPriceUsd = 'ethPriceUSD',
  Id = 'id'
}

export type DailyTotal = {
  __typename?: 'DailyTotal';
  /** Total fees in Eth */
  feesEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total fees in USD */
  feesUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Day timestamp */
  id: Scalars['ID']['output'];
  /** Number of trades */
  numberOfTrades: Scalars['BigInt']['output'];
  /** Total number of orders placed */
  orders: Scalars['BigInt']['output'];
  /** Total number of batches settled */
  settlements: Scalars['BigInt']['output'];
  /** Start day timestamp */
  timestamp: Scalars['Int']['output'];
  /** Total traded volume in ETH */
  volumeEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total traded volume in USD */
  volumeUsd?: Maybe<Scalars['BigDecimal']['output']>;
};

export type DailyTotal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DailyTotal_Filter>>>;
  feesEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  numberOfTrades?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_gt?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_gte?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_lte?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_not?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DailyTotal_Filter>>>;
  orders?: InputMaybe<Scalars['BigInt']['input']>;
  orders_gt?: InputMaybe<Scalars['BigInt']['input']>;
  orders_gte?: InputMaybe<Scalars['BigInt']['input']>;
  orders_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  orders_lt?: InputMaybe<Scalars['BigInt']['input']>;
  orders_lte?: InputMaybe<Scalars['BigInt']['input']>;
  orders_not?: InputMaybe<Scalars['BigInt']['input']>;
  orders_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  settlements?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_gt?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_gte?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  settlements_lt?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_lte?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_not?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  volumeEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum DailyTotal_OrderBy {
  FeesEth = 'feesEth',
  FeesUsd = 'feesUsd',
  Id = 'id',
  NumberOfTrades = 'numberOfTrades',
  Orders = 'orders',
  Settlements = 'settlements',
  Timestamp = 'timestamp',
  VolumeEth = 'volumeEth',
  VolumeUsd = 'volumeUsd'
}

export type HourlyTotal = {
  __typename?: 'HourlyTotal';
  /** Total fees in Eth */
  feesEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total fees in USD */
  feesUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Hour timestamp */
  id: Scalars['ID']['output'];
  /** Number of trades */
  numberOfTrades: Scalars['BigInt']['output'];
  /** Total number of orders placed */
  orders: Scalars['BigInt']['output'];
  /** Total number of batches settled */
  settlements: Scalars['BigInt']['output'];
  /** Start hour timestamp */
  timestamp: Scalars['Int']['output'];
  /** Total traded volume in ETH */
  volumeEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total traded volume in USD */
  volumeUsd?: Maybe<Scalars['BigDecimal']['output']>;
};

export type HourlyTotal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<HourlyTotal_Filter>>>;
  feesEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  numberOfTrades?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_gt?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_gte?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_lte?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_not?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<HourlyTotal_Filter>>>;
  orders?: InputMaybe<Scalars['BigInt']['input']>;
  orders_gt?: InputMaybe<Scalars['BigInt']['input']>;
  orders_gte?: InputMaybe<Scalars['BigInt']['input']>;
  orders_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  orders_lt?: InputMaybe<Scalars['BigInt']['input']>;
  orders_lte?: InputMaybe<Scalars['BigInt']['input']>;
  orders_not?: InputMaybe<Scalars['BigInt']['input']>;
  orders_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  settlements?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_gt?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_gte?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  settlements_lt?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_lte?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_not?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  volumeEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum HourlyTotal_OrderBy {
  FeesEth = 'feesEth',
  FeesUsd = 'feesUsd',
  Id = 'id',
  NumberOfTrades = 'numberOfTrades',
  Orders = 'orders',
  Settlements = 'settlements',
  Timestamp = 'timestamp',
  VolumeEth = 'volumeEth',
  VolumeUsd = 'volumeUsd'
}

export type Order = {
  __typename?: 'Order';
  /** Trade's OrderUid to hex string */
  id: Scalars['ID']['output'];
  /** block's timestamp on invalidate event */
  invalidateTimestamp?: Maybe<Scalars['Int']['output']>;
  /** Boolean value to show if the order is signed */
  isSigned?: Maybe<Scalars['Boolean']['output']>;
  /** Boolean value true by default unless is invalidated by the event */
  isValid?: Maybe<Scalars['Boolean']['output']>;
  /** Trade's owner or presign User */
  owner?: Maybe<User>;
  /** block's timestamp on presign event */
  presignTimestamp?: Maybe<Scalars['Int']['output']>;
  /** Array of trades on the order */
  trades?: Maybe<Array<Trade>>;
  /** block's timestamp on trade event */
  tradesTimestamp?: Maybe<Scalars['Int']['output']>;
};


export type OrderTradesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Trade_Filter>;
};

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Order_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Order_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  invalidateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  invalidateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  invalidateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  invalidateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  invalidateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  invalidateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  invalidateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  invalidateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  isSigned?: InputMaybe<Scalars['Boolean']['input']>;
  isSigned_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isSigned_not?: InputMaybe<Scalars['Boolean']['input']>;
  isSigned_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isValid?: InputMaybe<Scalars['Boolean']['input']>;
  isValid_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isValid_not?: InputMaybe<Scalars['Boolean']['input']>;
  isValid_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Order_Filter>>>;
  owner?: InputMaybe<Scalars['String']['input']>;
  owner_?: InputMaybe<User_Filter>;
  owner_contains?: InputMaybe<Scalars['String']['input']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_gt?: InputMaybe<Scalars['String']['input']>;
  owner_gte?: InputMaybe<Scalars['String']['input']>;
  owner_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_lt?: InputMaybe<Scalars['String']['input']>;
  owner_lte?: InputMaybe<Scalars['String']['input']>;
  owner_not?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  presignTimestamp?: InputMaybe<Scalars['Int']['input']>;
  presignTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  presignTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  presignTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  presignTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  presignTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  presignTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  presignTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tradesTimestamp?: InputMaybe<Scalars['Int']['input']>;
  tradesTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  tradesTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  tradesTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tradesTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  tradesTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  tradesTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  tradesTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  trades_?: InputMaybe<Trade_Filter>;
};

export enum Order_OrderBy {
  Id = 'id',
  InvalidateTimestamp = 'invalidateTimestamp',
  IsSigned = 'isSigned',
  IsValid = 'isValid',
  Owner = 'owner',
  OwnerAddress = 'owner__address',
  OwnerFirstTradeTimestamp = 'owner__firstTradeTimestamp',
  OwnerId = 'owner__id',
  OwnerIsSolver = 'owner__isSolver',
  OwnerLastIsSolverUpdateTimestamp = 'owner__lastIsSolverUpdateTimestamp',
  OwnerNumberOfSettlements = 'owner__numberOfSettlements',
  OwnerNumberOfTrades = 'owner__numberOfTrades',
  OwnerSolvedAmountEth = 'owner__solvedAmountEth',
  OwnerSolvedAmountUsd = 'owner__solvedAmountUsd',
  OwnerTradedAmountEth = 'owner__tradedAmountEth',
  OwnerTradedAmountUsd = 'owner__tradedAmountUsd',
  PresignTimestamp = 'presignTimestamp',
  Trades = 'trades',
  TradesTimestamp = 'tradesTimestamp'
}

export type Pair = {
  __typename?: 'Pair';
  /** Token0-token1 sorted by token0 < token1 */
  id: Scalars['ID']['output'];
  /** Last trade timestamp */
  lastTradeTimestamp: Scalars['Int']['output'];
  /** The token 0 address lower than token1 */
  token0: Token;
  /** Token 0 price expressed in token1 in the last trade */
  token0PriceInToken1?: Maybe<Scalars['BigDecimal']['output']>;
  /** Token0 last trade price in USD */
  token0Usd?: Maybe<Scalars['BigDecimal']['output']>;
  /** The token 1 address greater than token0 */
  token1: Token;
  /** Token 1 price expressed in token1 in the last trade */
  token1PriceInToken0?: Maybe<Scalars['BigDecimal']['output']>;
  /** Token1 last trade price in USD */
  token1Usd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total volume of token 0 traded */
  volumeToken0: Scalars['BigInt']['output'];
  /** Total volume of token 1 traded */
  volumeToken1: Scalars['BigInt']['output'];
  /** Total volume in Eth */
  volumeTradedEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total volume in Usd */
  volumeTradedUsd?: Maybe<Scalars['BigDecimal']['output']>;
};

export type PairDaily = {
  __typename?: 'PairDaily';
  /** token0-token1-timestamp sorted by token0 < token1 */
  id: Scalars['ID']['output'];
  /** Start day timestamp */
  timestamp: Scalars['Int']['output'];
  /** The token 0 address lower than token1 */
  token0: Token;
  /** Token 0 price expressed in token1 in the last trade */
  token0PriceInToken1?: Maybe<Scalars['BigDecimal']['output']>;
  /** Token0 last trade price in USD */
  token0Usd?: Maybe<Scalars['BigDecimal']['output']>;
  /** The token 1 address greater than token0 */
  token1: Token;
  /** Token 1 price expressed in token1 in the last trade */
  token1PriceInToken0?: Maybe<Scalars['BigDecimal']['output']>;
  /** Token1 last trade price in USD */
  token1Usd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total volume of token 0 traded */
  volumeToken0: Scalars['BigInt']['output'];
  /** Total volume of token 1 traded */
  volumeToken1: Scalars['BigInt']['output'];
  /** Total volume in Eth */
  volumeTradedEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total volume in Usd */
  volumeTradedUsd?: Maybe<Scalars['BigDecimal']['output']>;
};

export type PairDaily_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PairDaily_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<PairDaily_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0PriceInToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0PriceInToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Usd?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Usd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1PriceInToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1PriceInToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Usd?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Usd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  volumeToken0?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeTradedEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeTradedEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeTradedUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeTradedUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum PairDaily_OrderBy {
  Id = 'id',
  Timestamp = 'timestamp',
  Token0 = 'token0',
  Token0PriceInToken1 = 'token0PriceInToken1',
  Token0Usd = 'token0Usd',
  Token0Address = 'token0__address',
  Token0Decimals = 'token0__decimals',
  Token0FirstTradeTimestamp = 'token0__firstTradeTimestamp',
  Token0Id = 'token0__id',
  Token0Name = 'token0__name',
  Token0NumberOfTrades = 'token0__numberOfTrades',
  Token0PriceEth = 'token0__priceEth',
  Token0PriceUsd = 'token0__priceUsd',
  Token0Symbol = 'token0__symbol',
  Token0TotalVolume = 'token0__totalVolume',
  Token0TotalVolumeEth = 'token0__totalVolumeEth',
  Token0TotalVolumeUsd = 'token0__totalVolumeUsd',
  Token1 = 'token1',
  Token1PriceInToken0 = 'token1PriceInToken0',
  Token1Usd = 'token1Usd',
  Token1Address = 'token1__address',
  Token1Decimals = 'token1__decimals',
  Token1FirstTradeTimestamp = 'token1__firstTradeTimestamp',
  Token1Id = 'token1__id',
  Token1Name = 'token1__name',
  Token1NumberOfTrades = 'token1__numberOfTrades',
  Token1PriceEth = 'token1__priceEth',
  Token1PriceUsd = 'token1__priceUsd',
  Token1Symbol = 'token1__symbol',
  Token1TotalVolume = 'token1__totalVolume',
  Token1TotalVolumeEth = 'token1__totalVolumeEth',
  Token1TotalVolumeUsd = 'token1__totalVolumeUsd',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeTradedEth = 'volumeTradedEth',
  VolumeTradedUsd = 'volumeTradedUsd'
}

export type PairHourly = {
  __typename?: 'PairHourly';
  /** token0-token1-timestamp sorted by token0 < token1 */
  id: Scalars['ID']['output'];
  /** Start hour timestamp */
  timestamp: Scalars['Int']['output'];
  /** The token 0 address lower than token1 */
  token0: Token;
  /** Token 0 price expressed in token1 in the last trade */
  token0PriceInToken1?: Maybe<Scalars['BigDecimal']['output']>;
  /** Token0 last trade price in USD */
  token0Usd?: Maybe<Scalars['BigDecimal']['output']>;
  /** The token 1 address greater than token0 */
  token1: Token;
  /** Token 1 price expressed in token1 in the last trade */
  token1PriceInToken0?: Maybe<Scalars['BigDecimal']['output']>;
  /** Token1 last trade price in USD */
  token1Usd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total volume of token 0 traded */
  volumeToken0: Scalars['BigInt']['output'];
  /** Total volume of token 1 traded */
  volumeToken1: Scalars['BigInt']['output'];
  /** Total volume in Eth */
  volumeTradedEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total volume in Usd */
  volumeTradedUsd?: Maybe<Scalars['BigDecimal']['output']>;
};

export type PairHourly_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PairHourly_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<PairHourly_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0PriceInToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0PriceInToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Usd?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Usd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1PriceInToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1PriceInToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Usd?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Usd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  volumeToken0?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeTradedEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeTradedEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeTradedUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeTradedUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum PairHourly_OrderBy {
  Id = 'id',
  Timestamp = 'timestamp',
  Token0 = 'token0',
  Token0PriceInToken1 = 'token0PriceInToken1',
  Token0Usd = 'token0Usd',
  Token0Address = 'token0__address',
  Token0Decimals = 'token0__decimals',
  Token0FirstTradeTimestamp = 'token0__firstTradeTimestamp',
  Token0Id = 'token0__id',
  Token0Name = 'token0__name',
  Token0NumberOfTrades = 'token0__numberOfTrades',
  Token0PriceEth = 'token0__priceEth',
  Token0PriceUsd = 'token0__priceUsd',
  Token0Symbol = 'token0__symbol',
  Token0TotalVolume = 'token0__totalVolume',
  Token0TotalVolumeEth = 'token0__totalVolumeEth',
  Token0TotalVolumeUsd = 'token0__totalVolumeUsd',
  Token1 = 'token1',
  Token1PriceInToken0 = 'token1PriceInToken0',
  Token1Usd = 'token1Usd',
  Token1Address = 'token1__address',
  Token1Decimals = 'token1__decimals',
  Token1FirstTradeTimestamp = 'token1__firstTradeTimestamp',
  Token1Id = 'token1__id',
  Token1Name = 'token1__name',
  Token1NumberOfTrades = 'token1__numberOfTrades',
  Token1PriceEth = 'token1__priceEth',
  Token1PriceUsd = 'token1__priceUsd',
  Token1Symbol = 'token1__symbol',
  Token1TotalVolume = 'token1__totalVolume',
  Token1TotalVolumeEth = 'token1__totalVolumeEth',
  Token1TotalVolumeUsd = 'token1__totalVolumeUsd',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeTradedEth = 'volumeTradedEth',
  VolumeTradedUsd = 'volumeTradedUsd'
}

export type Pair_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Pair_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastTradeTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastTradeTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastTradeTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastTradeTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastTradeTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastTradeTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastTradeTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastTradeTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Pair_Filter>>>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0PriceInToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0PriceInToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0PriceInToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Usd?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Usd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Usd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1PriceInToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1PriceInToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1PriceInToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Usd?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Usd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Usd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  volumeToken0?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeTradedEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeTradedEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeTradedUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeTradedUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeTradedUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Pair_OrderBy {
  Id = 'id',
  LastTradeTimestamp = 'lastTradeTimestamp',
  Token0 = 'token0',
  Token0PriceInToken1 = 'token0PriceInToken1',
  Token0Usd = 'token0Usd',
  Token0Address = 'token0__address',
  Token0Decimals = 'token0__decimals',
  Token0FirstTradeTimestamp = 'token0__firstTradeTimestamp',
  Token0Id = 'token0__id',
  Token0Name = 'token0__name',
  Token0NumberOfTrades = 'token0__numberOfTrades',
  Token0PriceEth = 'token0__priceEth',
  Token0PriceUsd = 'token0__priceUsd',
  Token0Symbol = 'token0__symbol',
  Token0TotalVolume = 'token0__totalVolume',
  Token0TotalVolumeEth = 'token0__totalVolumeEth',
  Token0TotalVolumeUsd = 'token0__totalVolumeUsd',
  Token1 = 'token1',
  Token1PriceInToken0 = 'token1PriceInToken0',
  Token1Usd = 'token1Usd',
  Token1Address = 'token1__address',
  Token1Decimals = 'token1__decimals',
  Token1FirstTradeTimestamp = 'token1__firstTradeTimestamp',
  Token1Id = 'token1__id',
  Token1Name = 'token1__name',
  Token1NumberOfTrades = 'token1__numberOfTrades',
  Token1PriceEth = 'token1__priceEth',
  Token1PriceUsd = 'token1__priceUsd',
  Token1Symbol = 'token1__symbol',
  Token1TotalVolume = 'token1__totalVolume',
  Token1TotalVolumeEth = 'token1__totalVolumeEth',
  Token1TotalVolumeUsd = 'token1__totalVolumeUsd',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeTradedEth = 'volumeTradedEth',
  VolumeTradedUsd = 'volumeTradedUsd'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  bundle?: Maybe<Bundle>;
  bundles: Array<Bundle>;
  dailyTotal?: Maybe<DailyTotal>;
  dailyTotals: Array<DailyTotal>;
  hourlyTotal?: Maybe<HourlyTotal>;
  hourlyTotals: Array<HourlyTotal>;
  order?: Maybe<Order>;
  orders: Array<Order>;
  pair?: Maybe<Pair>;
  pairDailies: Array<PairDaily>;
  pairDaily?: Maybe<PairDaily>;
  pairHourlies: Array<PairHourly>;
  pairHourly?: Maybe<PairHourly>;
  pairs: Array<Pair>;
  settlement?: Maybe<Settlement>;
  settlements: Array<Settlement>;
  token?: Maybe<Token>;
  tokenDailyTotal?: Maybe<TokenDailyTotal>;
  tokenDailyTotals: Array<TokenDailyTotal>;
  tokenHourlyTotal?: Maybe<TokenHourlyTotal>;
  tokenHourlyTotals: Array<TokenHourlyTotal>;
  tokenTradingEvent?: Maybe<TokenTradingEvent>;
  tokenTradingEvents: Array<TokenTradingEvent>;
  tokens: Array<Token>;
  total?: Maybe<Total>;
  totals: Array<Total>;
  trade?: Maybe<Trade>;
  trades: Array<Trade>;
  uniswapPool?: Maybe<UniswapPool>;
  uniswapPools: Array<UniswapPool>;
  uniswapToken?: Maybe<UniswapToken>;
  uniswapTokens: Array<UniswapToken>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryBundleArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBundlesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Bundle_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Bundle_Filter>;
};


export type QueryDailyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDailyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DailyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DailyTotal_Filter>;
};


export type QueryHourlyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryHourlyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<HourlyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<HourlyTotal_Filter>;
};


export type QueryOrderArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryOrdersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Order_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Order_Filter>;
};


export type QueryPairArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPairDailiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PairDaily_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PairDaily_Filter>;
};


export type QueryPairDailyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPairHourliesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PairHourly_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PairHourly_Filter>;
};


export type QueryPairHourlyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPairsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Pair_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Pair_Filter>;
};


export type QuerySettlementArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerySettlementsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Settlement_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Settlement_Filter>;
};


export type QueryTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenDailyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenDailyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenDailyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenDailyTotal_Filter>;
};


export type QueryTokenHourlyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenHourlyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenHourlyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenHourlyTotal_Filter>;
};


export type QueryTokenTradingEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenTradingEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenTradingEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenTradingEvent_Filter>;
};


export type QueryTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token_Filter>;
};


export type QueryTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Total_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Total_Filter>;
};


export type QueryTradeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTradesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Trade_Filter>;
};


export type QueryUniswapPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUniswapPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UniswapPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UniswapPool_Filter>;
};


export type QueryUniswapTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUniswapTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UniswapToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UniswapToken_Filter>;
};


export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Settlement = {
  __typename?: 'Settlement';
  /** Trade's fee amount accumulated in Usd */
  aggregatedFeeAmountUsd: Scalars['BigDecimal']['output'];
  /** Block number */
  blockNumber: Scalars['BigInt']['output'];
  /** First trade timestamp */
  firstTradeTimestamp: Scalars['Int']['output'];
  /** TxHash */
  id: Scalars['ID']['output'];
  /** Profitability is aggregatedFeeAmountUsd minus txCostUsd */
  profitability: Scalars['BigDecimal']['output'];
  /** User who solved the settlement */
  solver?: Maybe<User>;
  /** Collection of trades */
  trades?: Maybe<Array<Trade>>;
  /** Transaction cost in Native currency */
  txCostNative: Scalars['BigDecimal']['output'];
  /** Transaction cost in USD */
  txCostUsd: Scalars['BigDecimal']['output'];
  /** Transaction hash */
  txHash: Scalars['Bytes']['output'];
};


export type SettlementTradesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Trade_Filter>;
};

export type Settlement_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  aggregatedFeeAmountUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  aggregatedFeeAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  aggregatedFeeAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  aggregatedFeeAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  aggregatedFeeAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  aggregatedFeeAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  aggregatedFeeAmountUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  aggregatedFeeAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Settlement_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstTradeTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstTradeTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Settlement_Filter>>>;
  profitability?: InputMaybe<Scalars['BigDecimal']['input']>;
  profitability_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  profitability_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  profitability_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  profitability_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  profitability_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  profitability_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  profitability_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  solver?: InputMaybe<Scalars['String']['input']>;
  solver_?: InputMaybe<User_Filter>;
  solver_contains?: InputMaybe<Scalars['String']['input']>;
  solver_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  solver_ends_with?: InputMaybe<Scalars['String']['input']>;
  solver_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  solver_gt?: InputMaybe<Scalars['String']['input']>;
  solver_gte?: InputMaybe<Scalars['String']['input']>;
  solver_in?: InputMaybe<Array<Scalars['String']['input']>>;
  solver_lt?: InputMaybe<Scalars['String']['input']>;
  solver_lte?: InputMaybe<Scalars['String']['input']>;
  solver_not?: InputMaybe<Scalars['String']['input']>;
  solver_not_contains?: InputMaybe<Scalars['String']['input']>;
  solver_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  solver_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  solver_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  solver_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  solver_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  solver_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  solver_starts_with?: InputMaybe<Scalars['String']['input']>;
  solver_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  trades_?: InputMaybe<Trade_Filter>;
  txCostNative?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostNative_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostNative_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostNative_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCostNative_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostNative_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostNative_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostNative_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCostUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCostUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  txCostUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum Settlement_OrderBy {
  AggregatedFeeAmountUsd = 'aggregatedFeeAmountUsd',
  BlockNumber = 'blockNumber',
  FirstTradeTimestamp = 'firstTradeTimestamp',
  Id = 'id',
  Profitability = 'profitability',
  Solver = 'solver',
  SolverAddress = 'solver__address',
  SolverFirstTradeTimestamp = 'solver__firstTradeTimestamp',
  SolverId = 'solver__id',
  SolverIsSolver = 'solver__isSolver',
  SolverLastIsSolverUpdateTimestamp = 'solver__lastIsSolverUpdateTimestamp',
  SolverNumberOfSettlements = 'solver__numberOfSettlements',
  SolverNumberOfTrades = 'solver__numberOfTrades',
  SolverSolvedAmountEth = 'solver__solvedAmountEth',
  SolverSolvedAmountUsd = 'solver__solvedAmountUsd',
  SolverTradedAmountEth = 'solver__tradedAmountEth',
  SolverTradedAmountUsd = 'solver__tradedAmountUsd',
  Trades = 'trades',
  TxCostNative = 'txCostNative',
  TxCostUsd = 'txCostUsd',
  TxHash = 'txHash'
}

export type Token = {
  __typename?: 'Token';
  /** Token address */
  address: Scalars['Bytes']['output'];
  /** Daily totals */
  dailyTotals: Array<TokenDailyTotal>;
  /** Token decimals fetched by contract call */
  decimals: Scalars['Int']['output'];
  /** First token trade block timestamp */
  firstTradeTimestamp: Scalars['Int']['output'];
  /** History of trading for this token */
  history: Array<TokenTradingEvent>;
  /** Hourly totals */
  hourlyTotals: Array<TokenHourlyTotal>;
  /** Token address to hexString */
  id: Scalars['ID']['output'];
  /** Token name fetched by ERC20 contract call */
  name: Scalars['String']['output'];
  /** Total trades */
  numberOfTrades: Scalars['Int']['output'];
  /** Derived price in ETH */
  priceEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Derived price in USD */
  priceUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Token symbol fetched by contract call */
  symbol: Scalars['String']['output'];
  /** Total volume managed in CowSwap */
  totalVolume: Scalars['BigInt']['output'];
  /** Total volume in Eth */
  totalVolumeEth: Scalars['BigDecimal']['output'];
  /** Total volume in Usd */
  totalVolumeUsd: Scalars['BigDecimal']['output'];
};


export type TokenDailyTotalsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenDailyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TokenDailyTotal_Filter>;
};


export type TokenHistoryArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenTradingEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TokenTradingEvent_Filter>;
};


export type TokenHourlyTotalsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenHourlyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TokenHourlyTotal_Filter>;
};

export type TokenDailyTotal = {
  __typename?: 'TokenDailyTotal';
  /** Average trade price */
  averagePrice: Scalars['BigDecimal']['output'];
  /** Last trade price */
  closePrice: Scalars['BigDecimal']['output'];
  /** Higher trade price */
  higherPrice: Scalars['BigDecimal']['output'];
  /** TokenAddress + timestamp day */
  id: Scalars['ID']['output'];
  /** Lower trade price */
  lowerPrice: Scalars['BigDecimal']['output'];
  /** First trade price */
  openPrice: Scalars['BigDecimal']['output'];
  /** Start day timestamp */
  timestamp: Scalars['Int']['output'];
  /** Token address */
  token: Token;
  /** Number of trades that day */
  totalTrades: Scalars['BigInt']['output'];
  /** Total volume traded that day in token */
  totalVolume: Scalars['BigInt']['output'];
  /** Total amount traded that day in ETH */
  totalVolumeEth: Scalars['BigDecimal']['output'];
  /** Total amount traded that day in USD */
  totalVolumeUsd: Scalars['BigDecimal']['output'];
};

export type TokenDailyTotal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenDailyTotal_Filter>>>;
  averagePrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  averagePrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  closePrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  closePrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  higherPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  higherPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lowerPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lowerPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  openPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  openPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<TokenDailyTotal_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalTrades?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalTrades_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalVolume?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolumeEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalVolume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum TokenDailyTotal_OrderBy {
  AveragePrice = 'averagePrice',
  ClosePrice = 'closePrice',
  HigherPrice = 'higherPrice',
  Id = 'id',
  LowerPrice = 'lowerPrice',
  OpenPrice = 'openPrice',
  Timestamp = 'timestamp',
  Token = 'token',
  TokenAddress = 'token__address',
  TokenDecimals = 'token__decimals',
  TokenFirstTradeTimestamp = 'token__firstTradeTimestamp',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenNumberOfTrades = 'token__numberOfTrades',
  TokenPriceEth = 'token__priceEth',
  TokenPriceUsd = 'token__priceUsd',
  TokenSymbol = 'token__symbol',
  TokenTotalVolume = 'token__totalVolume',
  TokenTotalVolumeEth = 'token__totalVolumeEth',
  TokenTotalVolumeUsd = 'token__totalVolumeUsd',
  TotalTrades = 'totalTrades',
  TotalVolume = 'totalVolume',
  TotalVolumeEth = 'totalVolumeEth',
  TotalVolumeUsd = 'totalVolumeUsd'
}

export type TokenHourlyTotal = {
  __typename?: 'TokenHourlyTotal';
  /** Average trade price */
  averagePrice: Scalars['BigDecimal']['output'];
  /** Last trade price */
  closePrice: Scalars['BigDecimal']['output'];
  /** Higher trade price */
  higherPrice: Scalars['BigDecimal']['output'];
  /** TokenAddress + timestamp hour */
  id: Scalars['ID']['output'];
  /** Lower trade price */
  lowerPrice: Scalars['BigDecimal']['output'];
  /** First trade price */
  openPrice: Scalars['BigDecimal']['output'];
  /** Start hour timestamp */
  timestamp: Scalars['Int']['output'];
  /** Token address */
  token: Token;
  /** Number of trades that hour */
  totalTrades: Scalars['BigInt']['output'];
  /** Total volume traded that day in token */
  totalVolume: Scalars['BigInt']['output'];
  /** Total amount traded that hour in ETH */
  totalVolumeEth: Scalars['BigDecimal']['output'];
  /** Total amount traded that hour in USD */
  totalVolumeUsd: Scalars['BigDecimal']['output'];
};

export type TokenHourlyTotal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenHourlyTotal_Filter>>>;
  averagePrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  averagePrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  averagePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  closePrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  closePrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  closePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  higherPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  higherPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  higherPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lowerPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lowerPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lowerPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  openPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  openPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  openPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<TokenHourlyTotal_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalTrades?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalTrades_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalTrades_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalVolume?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolumeEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalVolume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum TokenHourlyTotal_OrderBy {
  AveragePrice = 'averagePrice',
  ClosePrice = 'closePrice',
  HigherPrice = 'higherPrice',
  Id = 'id',
  LowerPrice = 'lowerPrice',
  OpenPrice = 'openPrice',
  Timestamp = 'timestamp',
  Token = 'token',
  TokenAddress = 'token__address',
  TokenDecimals = 'token__decimals',
  TokenFirstTradeTimestamp = 'token__firstTradeTimestamp',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenNumberOfTrades = 'token__numberOfTrades',
  TokenPriceEth = 'token__priceEth',
  TokenPriceUsd = 'token__priceUsd',
  TokenSymbol = 'token__symbol',
  TokenTotalVolume = 'token__totalVolume',
  TokenTotalVolumeEth = 'token__totalVolumeEth',
  TokenTotalVolumeUsd = 'token__totalVolumeUsd',
  TotalTrades = 'totalTrades',
  TotalVolume = 'totalVolume',
  TotalVolumeEth = 'totalVolumeEth',
  TotalVolumeUsd = 'totalVolumeUsd'
}

export type TokenTradingEvent = {
  __typename?: 'TokenTradingEvent';
  /** Amount in Eth */
  amountEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Amount in Usd */
  amountUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Id built using token-timestamp */
  id: Scalars['ID']['output'];
  /** Timestamp */
  timestamp: Scalars['Int']['output'];
  /** Token */
  token: Token;
  /** Trade */
  trade: Trade;
};

export type TokenTradingEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amountEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amountEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amountUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amountUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  and?: InputMaybe<Array<InputMaybe<TokenTradingEvent_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<TokenTradingEvent_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  trade?: InputMaybe<Scalars['String']['input']>;
  trade_?: InputMaybe<Trade_Filter>;
  trade_contains?: InputMaybe<Scalars['String']['input']>;
  trade_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  trade_ends_with?: InputMaybe<Scalars['String']['input']>;
  trade_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  trade_gt?: InputMaybe<Scalars['String']['input']>;
  trade_gte?: InputMaybe<Scalars['String']['input']>;
  trade_in?: InputMaybe<Array<Scalars['String']['input']>>;
  trade_lt?: InputMaybe<Scalars['String']['input']>;
  trade_lte?: InputMaybe<Scalars['String']['input']>;
  trade_not?: InputMaybe<Scalars['String']['input']>;
  trade_not_contains?: InputMaybe<Scalars['String']['input']>;
  trade_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  trade_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  trade_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  trade_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  trade_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  trade_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  trade_starts_with?: InputMaybe<Scalars['String']['input']>;
  trade_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum TokenTradingEvent_OrderBy {
  AmountEth = 'amountEth',
  AmountUsd = 'amountUsd',
  Id = 'id',
  Timestamp = 'timestamp',
  Token = 'token',
  TokenAddress = 'token__address',
  TokenDecimals = 'token__decimals',
  TokenFirstTradeTimestamp = 'token__firstTradeTimestamp',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenNumberOfTrades = 'token__numberOfTrades',
  TokenPriceEth = 'token__priceEth',
  TokenPriceUsd = 'token__priceUsd',
  TokenSymbol = 'token__symbol',
  TokenTotalVolume = 'token__totalVolume',
  TokenTotalVolumeEth = 'token__totalVolumeEth',
  TokenTotalVolumeUsd = 'token__totalVolumeUsd',
  Trade = 'trade',
  TradeBuyAmount = 'trade__buyAmount',
  TradeBuyAmountEth = 'trade__buyAmountEth',
  TradeBuyAmountUsd = 'trade__buyAmountUsd',
  TradeFeeAmount = 'trade__feeAmount',
  TradeFeeAmountEth = 'trade__feeAmountEth',
  TradeFeeAmountUsd = 'trade__feeAmountUsd',
  TradeGasPrice = 'trade__gasPrice',
  TradeGasUsed = 'trade__gasUsed',
  TradeId = 'trade__id',
  TradeSellAmount = 'trade__sellAmount',
  TradeSellAmountEth = 'trade__sellAmountEth',
  TradeSellAmountUsd = 'trade__sellAmountUsd',
  TradeTimestamp = 'trade__timestamp',
  TradeTxHash = 'trade__txHash'
}

export type Token_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  dailyTotals_?: InputMaybe<TokenDailyTotal_Filter>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstTradeTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstTradeTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  history_?: InputMaybe<TokenTradingEvent_Filter>;
  hourlyTotals_?: InputMaybe<TokenHourlyTotal_Filter>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  numberOfTrades?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_gt?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_gte?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_lte?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_not?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  priceEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_gt?: InputMaybe<Scalars['String']['input']>;
  symbol_gte?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_lt?: InputMaybe<Scalars['String']['input']>;
  symbol_lte?: InputMaybe<Scalars['String']['input']>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalVolume?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolumeEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalVolume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalVolume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Token_OrderBy {
  Address = 'address',
  DailyTotals = 'dailyTotals',
  Decimals = 'decimals',
  FirstTradeTimestamp = 'firstTradeTimestamp',
  History = 'history',
  HourlyTotals = 'hourlyTotals',
  Id = 'id',
  Name = 'name',
  NumberOfTrades = 'numberOfTrades',
  PriceEth = 'priceEth',
  PriceUsd = 'priceUsd',
  Symbol = 'symbol',
  TotalVolume = 'totalVolume',
  TotalVolumeEth = 'totalVolumeEth',
  TotalVolumeUsd = 'totalVolumeUsd'
}

export type Total = {
  __typename?: 'Total';
  /** Total fees in Eth */
  feesEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total fees in USD */
  feesUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** This is a singleton entity to contain accumulators for all values. Id will be always 1 */
  id: Scalars['ID']['output'];
  /** Number of trades */
  numberOfTrades: Scalars['BigInt']['output'];
  /** Total number of orders placed */
  orders: Scalars['BigInt']['output'];
  /** Total number of batches settled */
  settlements: Scalars['BigInt']['output'];
  /** Total number of tokens traded */
  tokens: Scalars['BigInt']['output'];
  /** Total number of traders */
  traders: Scalars['BigInt']['output'];
  /** Total traded volume in ETH */
  volumeEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Total traded volume in USD */
  volumeUsd?: Maybe<Scalars['BigDecimal']['output']>;
};

export type Total_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Total_Filter>>>;
  feesEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  numberOfTrades?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_gt?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_gte?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_lte?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_not?: InputMaybe<Scalars['BigInt']['input']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Total_Filter>>>;
  orders?: InputMaybe<Scalars['BigInt']['input']>;
  orders_gt?: InputMaybe<Scalars['BigInt']['input']>;
  orders_gte?: InputMaybe<Scalars['BigInt']['input']>;
  orders_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  orders_lt?: InputMaybe<Scalars['BigInt']['input']>;
  orders_lte?: InputMaybe<Scalars['BigInt']['input']>;
  orders_not?: InputMaybe<Scalars['BigInt']['input']>;
  orders_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  settlements?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_gt?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_gte?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  settlements_lt?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_lte?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_not?: InputMaybe<Scalars['BigInt']['input']>;
  settlements_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokens?: InputMaybe<Scalars['BigInt']['input']>;
  tokens_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokens_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokens_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokens_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokens_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokens_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokens_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  traders?: InputMaybe<Scalars['BigInt']['input']>;
  traders_gt?: InputMaybe<Scalars['BigInt']['input']>;
  traders_gte?: InputMaybe<Scalars['BigInt']['input']>;
  traders_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  traders_lt?: InputMaybe<Scalars['BigInt']['input']>;
  traders_lte?: InputMaybe<Scalars['BigInt']['input']>;
  traders_not?: InputMaybe<Scalars['BigInt']['input']>;
  traders_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Total_OrderBy {
  FeesEth = 'feesEth',
  FeesUsd = 'feesUsd',
  Id = 'id',
  NumberOfTrades = 'numberOfTrades',
  Orders = 'orders',
  Settlements = 'settlements',
  Tokens = 'tokens',
  Traders = 'traders',
  VolumeEth = 'volumeEth',
  VolumeUsd = 'volumeUsd'
}

export type Trade = {
  __typename?: 'Trade';
  /** Trade event buyAmount */
  buyAmount: Scalars['BigInt']['output'];
  /** Buy amount in Eth */
  buyAmountEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Buy amount in Usd */
  buyAmountUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Trade event buyToken */
  buyToken: Token;
  /** Trade's fee amount */
  feeAmount: Scalars['BigInt']['output'];
  /** Trade's fee amount in Eth */
  feeAmountEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Trade's fee amount in Usd */
  feeAmountUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Transaction's gas price */
  gasPrice: Scalars['BigInt']['output'];
  gasUsed: Scalars['BigInt']['output'];
  /** This Id is composed using orderId|txHashString|eventIndex */
  id: Scalars['ID']['output'];
  /** Order */
  order: Order;
  /** Trade event sellAmount */
  sellAmount: Scalars['BigInt']['output'];
  /** Sell amount in Eth */
  sellAmountEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Sell amount in Usd */
  sellAmountUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Trade event sellToken */
  sellToken: Token;
  /** Settlement */
  settlement: Settlement;
  /** Block's timestamp */
  timestamp: Scalars['Int']['output'];
  /** Trade event transaction hash */
  txHash: Scalars['Bytes']['output'];
};

export type Trade_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Trade_Filter>>>;
  buyAmount?: InputMaybe<Scalars['BigInt']['input']>;
  buyAmountEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  buyAmountEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  buyAmountUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  buyAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  buyAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  buyAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  buyAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  buyAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  buyAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  buyAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  buyAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  buyAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  buyToken?: InputMaybe<Scalars['String']['input']>;
  buyToken_?: InputMaybe<Token_Filter>;
  buyToken_contains?: InputMaybe<Scalars['String']['input']>;
  buyToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  buyToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  buyToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  buyToken_gt?: InputMaybe<Scalars['String']['input']>;
  buyToken_gte?: InputMaybe<Scalars['String']['input']>;
  buyToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  buyToken_lt?: InputMaybe<Scalars['String']['input']>;
  buyToken_lte?: InputMaybe<Scalars['String']['input']>;
  buyToken_not?: InputMaybe<Scalars['String']['input']>;
  buyToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  buyToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  buyToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  buyToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  buyToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  buyToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  buyToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  buyToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  buyToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  feeAmount?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmountEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeAmountEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeAmountUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  gasUsed?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_gt?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_gte?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  gasUsed_lt?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_lte?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_not?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Trade_Filter>>>;
  order?: InputMaybe<Scalars['String']['input']>;
  order_?: InputMaybe<Order_Filter>;
  order_contains?: InputMaybe<Scalars['String']['input']>;
  order_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  order_ends_with?: InputMaybe<Scalars['String']['input']>;
  order_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  order_gt?: InputMaybe<Scalars['String']['input']>;
  order_gte?: InputMaybe<Scalars['String']['input']>;
  order_in?: InputMaybe<Array<Scalars['String']['input']>>;
  order_lt?: InputMaybe<Scalars['String']['input']>;
  order_lte?: InputMaybe<Scalars['String']['input']>;
  order_not?: InputMaybe<Scalars['String']['input']>;
  order_not_contains?: InputMaybe<Scalars['String']['input']>;
  order_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  order_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  order_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  order_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  order_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  order_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  order_starts_with?: InputMaybe<Scalars['String']['input']>;
  order_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sellAmount?: InputMaybe<Scalars['BigInt']['input']>;
  sellAmountEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  sellAmountEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  sellAmountUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  sellAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  sellAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  sellAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sellAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sellAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sellAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sellAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sellAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  sellAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sellToken?: InputMaybe<Scalars['String']['input']>;
  sellToken_?: InputMaybe<Token_Filter>;
  sellToken_contains?: InputMaybe<Scalars['String']['input']>;
  sellToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sellToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  sellToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sellToken_gt?: InputMaybe<Scalars['String']['input']>;
  sellToken_gte?: InputMaybe<Scalars['String']['input']>;
  sellToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sellToken_lt?: InputMaybe<Scalars['String']['input']>;
  sellToken_lte?: InputMaybe<Scalars['String']['input']>;
  sellToken_not?: InputMaybe<Scalars['String']['input']>;
  sellToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  sellToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sellToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  sellToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sellToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sellToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  sellToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sellToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  sellToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  settlement?: InputMaybe<Scalars['String']['input']>;
  settlement_?: InputMaybe<Settlement_Filter>;
  settlement_contains?: InputMaybe<Scalars['String']['input']>;
  settlement_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  settlement_ends_with?: InputMaybe<Scalars['String']['input']>;
  settlement_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  settlement_gt?: InputMaybe<Scalars['String']['input']>;
  settlement_gte?: InputMaybe<Scalars['String']['input']>;
  settlement_in?: InputMaybe<Array<Scalars['String']['input']>>;
  settlement_lt?: InputMaybe<Scalars['String']['input']>;
  settlement_lte?: InputMaybe<Scalars['String']['input']>;
  settlement_not?: InputMaybe<Scalars['String']['input']>;
  settlement_not_contains?: InputMaybe<Scalars['String']['input']>;
  settlement_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  settlement_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  settlement_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  settlement_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  settlement_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  settlement_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  settlement_starts_with?: InputMaybe<Scalars['String']['input']>;
  settlement_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum Trade_OrderBy {
  BuyAmount = 'buyAmount',
  BuyAmountEth = 'buyAmountEth',
  BuyAmountUsd = 'buyAmountUsd',
  BuyToken = 'buyToken',
  BuyTokenAddress = 'buyToken__address',
  BuyTokenDecimals = 'buyToken__decimals',
  BuyTokenFirstTradeTimestamp = 'buyToken__firstTradeTimestamp',
  BuyTokenId = 'buyToken__id',
  BuyTokenName = 'buyToken__name',
  BuyTokenNumberOfTrades = 'buyToken__numberOfTrades',
  BuyTokenPriceEth = 'buyToken__priceEth',
  BuyTokenPriceUsd = 'buyToken__priceUsd',
  BuyTokenSymbol = 'buyToken__symbol',
  BuyTokenTotalVolume = 'buyToken__totalVolume',
  BuyTokenTotalVolumeEth = 'buyToken__totalVolumeEth',
  BuyTokenTotalVolumeUsd = 'buyToken__totalVolumeUsd',
  FeeAmount = 'feeAmount',
  FeeAmountEth = 'feeAmountEth',
  FeeAmountUsd = 'feeAmountUsd',
  GasPrice = 'gasPrice',
  GasUsed = 'gasUsed',
  Id = 'id',
  Order = 'order',
  OrderId = 'order__id',
  OrderInvalidateTimestamp = 'order__invalidateTimestamp',
  OrderIsSigned = 'order__isSigned',
  OrderIsValid = 'order__isValid',
  OrderPresignTimestamp = 'order__presignTimestamp',
  OrderTradesTimestamp = 'order__tradesTimestamp',
  SellAmount = 'sellAmount',
  SellAmountEth = 'sellAmountEth',
  SellAmountUsd = 'sellAmountUsd',
  SellToken = 'sellToken',
  SellTokenAddress = 'sellToken__address',
  SellTokenDecimals = 'sellToken__decimals',
  SellTokenFirstTradeTimestamp = 'sellToken__firstTradeTimestamp',
  SellTokenId = 'sellToken__id',
  SellTokenName = 'sellToken__name',
  SellTokenNumberOfTrades = 'sellToken__numberOfTrades',
  SellTokenPriceEth = 'sellToken__priceEth',
  SellTokenPriceUsd = 'sellToken__priceUsd',
  SellTokenSymbol = 'sellToken__symbol',
  SellTokenTotalVolume = 'sellToken__totalVolume',
  SellTokenTotalVolumeEth = 'sellToken__totalVolumeEth',
  SellTokenTotalVolumeUsd = 'sellToken__totalVolumeUsd',
  Settlement = 'settlement',
  SettlementAggregatedFeeAmountUsd = 'settlement__aggregatedFeeAmountUsd',
  SettlementBlockNumber = 'settlement__blockNumber',
  SettlementFirstTradeTimestamp = 'settlement__firstTradeTimestamp',
  SettlementId = 'settlement__id',
  SettlementProfitability = 'settlement__profitability',
  SettlementTxCostNative = 'settlement__txCostNative',
  SettlementTxCostUsd = 'settlement__txCostUsd',
  SettlementTxHash = 'settlement__txHash',
  Timestamp = 'timestamp',
  TxHash = 'txHash'
}

export type UniswapPool = {
  __typename?: 'UniswapPool';
  /** Pool address */
  id: Scalars['ID']['output'];
  /** In range liquidity */
  liquidity: Scalars['BigInt']['output'];
  /** Current tick */
  tick?: Maybe<Scalars['BigInt']['output']>;
  /** Token0 */
  token0: UniswapToken;
  /** Token0 per token1 */
  token0Price: Scalars['BigDecimal']['output'];
  /** Token1 */
  token1: UniswapToken;
  /** Token1 per token0 */
  token1Price: Scalars['BigDecimal']['output'];
  /** Total token 0 across all ticks */
  totalValueLockedToken0: Scalars['BigDecimal']['output'];
  /** Total token 1 across all ticks */
  totalValueLockedToken1: Scalars['BigDecimal']['output'];
};

export type UniswapPool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<UniswapPool_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<UniswapPool_Filter>>>;
  tick?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0_?: InputMaybe<UniswapToken_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1_?: InputMaybe<UniswapToken_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalValueLockedToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum UniswapPool_OrderBy {
  Id = 'id',
  Liquidity = 'liquidity',
  Tick = 'tick',
  Token0 = 'token0',
  Token0Price = 'token0Price',
  Token0Address = 'token0__address',
  Token0Decimals = 'token0__decimals',
  Token0Id = 'token0__id',
  Token0Name = 'token0__name',
  Token0PriceEth = 'token0__priceEth',
  Token0PriceUsd = 'token0__priceUsd',
  Token0Symbol = 'token0__symbol',
  Token1 = 'token1',
  Token1Price = 'token1Price',
  Token1Address = 'token1__address',
  Token1Decimals = 'token1__decimals',
  Token1Id = 'token1__id',
  Token1Name = 'token1__name',
  Token1PriceEth = 'token1__priceEth',
  Token1PriceUsd = 'token1__priceUsd',
  Token1Symbol = 'token1__symbol',
  TotalValueLockedToken0 = 'totalValueLockedToken0',
  TotalValueLockedToken1 = 'totalValueLockedToken1'
}

export type UniswapToken = {
  __typename?: 'UniswapToken';
  /** Token address */
  address: Scalars['Bytes']['output'];
  /** Pools token is in that are allow listed for USD pricing */
  allowedPools: Array<UniswapToken>;
  /** Token decimals fetched by contract call */
  decimals: Scalars['Int']['output'];
  /** Token address to hexString */
  id: Scalars['ID']['output'];
  /** Token name fetched by ERC20 contract call */
  name: Scalars['String']['output'];
  /** Derived price in ETH */
  priceEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** Derived price in USD */
  priceUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** Token symbol fetched by contract call */
  symbol: Scalars['String']['output'];
};


export type UniswapTokenAllowedPoolsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UniswapToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<UniswapToken_Filter>;
};

export type UniswapToken_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  allowedPools?: InputMaybe<Array<Scalars['String']['input']>>;
  allowedPools_?: InputMaybe<UniswapToken_Filter>;
  allowedPools_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  allowedPools_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  allowedPools_not?: InputMaybe<Array<Scalars['String']['input']>>;
  allowedPools_not_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  allowedPools_not_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  and?: InputMaybe<Array<InputMaybe<UniswapToken_Filter>>>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<UniswapToken_Filter>>>;
  priceEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_gt?: InputMaybe<Scalars['String']['input']>;
  symbol_gte?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_lt?: InputMaybe<Scalars['String']['input']>;
  symbol_lte?: InputMaybe<Scalars['String']['input']>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum UniswapToken_OrderBy {
  Address = 'address',
  AllowedPools = 'allowedPools',
  Decimals = 'decimals',
  Id = 'id',
  Name = 'name',
  PriceEth = 'priceEth',
  PriceUsd = 'priceUsd',
  Symbol = 'symbol'
}

export type User = {
  __typename?: 'User';
  /** Owner's address */
  address: Scalars['Bytes']['output'];
  /** First trade block timestamp */
  firstTradeTimestamp: Scalars['Int']['output'];
  /** Trade event order owner */
  id: Scalars['ID']['output'];
  /** Determine if user has solved a settlement */
  isSolver: Scalars['Boolean']['output'];
  /** Stores last time is solver flag changed */
  lastIsSolverUpdateTimestamp?: Maybe<Scalars['Int']['output']>;
  /** The quantity of settlements solved by the user */
  numberOfSettlements?: Maybe<Scalars['Int']['output']>;
  /** Solved trades */
  numberOfTrades: Scalars['Int']['output'];
  /** List of orders placed by this user */
  ordersPlaced: Array<Order>;
  /** Contains all the settlements solved by a solver */
  settlementsSolved: Array<Settlement>;
  /** total amount solved by the user in Eth */
  solvedAmountEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** total amount solved by the user in Usd */
  solvedAmountUsd?: Maybe<Scalars['BigDecimal']['output']>;
  /** total amount traded by the user in Eth */
  tradedAmountEth?: Maybe<Scalars['BigDecimal']['output']>;
  /** total amount traded by the user in Usd */
  tradedAmountUsd?: Maybe<Scalars['BigDecimal']['output']>;
};


export type UserOrdersPlacedArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Order_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Order_Filter>;
};


export type UserSettlementsSolvedArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Settlement_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Settlement_Filter>;
};

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  firstTradeTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstTradeTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstTradeTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  isSolver?: InputMaybe<Scalars['Boolean']['input']>;
  isSolver_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isSolver_not?: InputMaybe<Scalars['Boolean']['input']>;
  isSolver_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  lastIsSolverUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastIsSolverUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastIsSolverUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastIsSolverUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastIsSolverUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastIsSolverUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastIsSolverUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastIsSolverUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  numberOfSettlements?: InputMaybe<Scalars['Int']['input']>;
  numberOfSettlements_gt?: InputMaybe<Scalars['Int']['input']>;
  numberOfSettlements_gte?: InputMaybe<Scalars['Int']['input']>;
  numberOfSettlements_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  numberOfSettlements_lt?: InputMaybe<Scalars['Int']['input']>;
  numberOfSettlements_lte?: InputMaybe<Scalars['Int']['input']>;
  numberOfSettlements_not?: InputMaybe<Scalars['Int']['input']>;
  numberOfSettlements_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  numberOfTrades?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_gt?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_gte?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_lte?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_not?: InputMaybe<Scalars['Int']['input']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  ordersPlaced_?: InputMaybe<Order_Filter>;
  settlementsSolved_?: InputMaybe<Settlement_Filter>;
  solvedAmountEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  solvedAmountEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  solvedAmountUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  solvedAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  solvedAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tradedAmountEth?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountEth_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountEth_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountEth_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tradedAmountEth_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountEth_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountEth_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tradedAmountUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tradedAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  tradedAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum User_OrderBy {
  Address = 'address',
  FirstTradeTimestamp = 'firstTradeTimestamp',
  Id = 'id',
  IsSolver = 'isSolver',
  LastIsSolverUpdateTimestamp = 'lastIsSolverUpdateTimestamp',
  NumberOfSettlements = 'numberOfSettlements',
  NumberOfTrades = 'numberOfTrades',
  OrdersPlaced = 'ordersPlaced',
  SettlementsSolved = 'settlementsSolved',
  SolvedAmountEth = 'solvedAmountEth',
  SolvedAmountUsd = 'solvedAmountUsd',
  TradedAmountEth = 'tradedAmountEth',
  TradedAmountUsd = 'tradedAmountUsd'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type TotalsQueryVariables = Exact<{ [key: string]: never; }>;


export type TotalsQuery = { __typename?: 'Query', totals: Array<{ __typename?: 'Total', tokens: any, orders: any, traders: any, settlements: any, volumeUsd?: any | null, volumeEth?: any | null, feesUsd?: any | null, feesEth?: any | null }> };

export type LastDaysVolumeQueryVariables = Exact<{
  days: Scalars['Int']['input'];
}>;


export type LastDaysVolumeQuery = { __typename?: 'Query', dailyTotals: Array<{ __typename?: 'DailyTotal', timestamp: number, volumeUsd?: any | null }> };

export type LastHoursVolumeQueryVariables = Exact<{
  hours: Scalars['Int']['input'];
}>;


export type LastHoursVolumeQuery = { __typename?: 'Query', hourlyTotals: Array<{ __typename?: 'HourlyTotal', timestamp: number, volumeUsd?: any | null }> };
