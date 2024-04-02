export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
  Int8: any;
  Timestamp: any;
};

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type Bundle = {
  __typename?: 'Bundle';
  /** Price of ETH in usd */
  ethPriceUSD: Scalars['BigDecimal'];
  /** Singleton #1 */
  id: Scalars['ID'];
};

export type Bundle_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>;
  ethPriceUSD?: InputMaybe<Scalars['BigDecimal']>;
  ethPriceUSD_gt?: InputMaybe<Scalars['BigDecimal']>;
  ethPriceUSD_gte?: InputMaybe<Scalars['BigDecimal']>;
  ethPriceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  ethPriceUSD_lt?: InputMaybe<Scalars['BigDecimal']>;
  ethPriceUSD_lte?: InputMaybe<Scalars['BigDecimal']>;
  ethPriceUSD_not?: InputMaybe<Scalars['BigDecimal']>;
  ethPriceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>;
};

export enum Bundle_OrderBy {
  EthPriceUsd = 'ethPriceUSD',
  Id = 'id'
}

export type DailyTotal = {
  __typename?: 'DailyTotal';
  /** Total fees in Eth */
  feesEth?: Maybe<Scalars['BigDecimal']>;
  /** Total fees in USD */
  feesUsd?: Maybe<Scalars['BigDecimal']>;
  /** Day timestamp */
  id: Scalars['ID'];
  /** Number of trades */
  numberOfTrades: Scalars['BigInt'];
  /** Total number of orders placed */
  orders: Scalars['BigInt'];
  /** Total number of batches settled */
  settlements: Scalars['BigInt'];
  /** Start day timestamp */
  timestamp: Scalars['Int'];
  /** Traded tokens */
  tokens: Array<Token>;
  /** Total number of tokens traded */
  totalTokens: Scalars['BigInt'];
  /** Total traded volume in ETH */
  volumeEth?: Maybe<Scalars['BigDecimal']>;
  /** Total traded volume in USD */
  volumeUsd?: Maybe<Scalars['BigDecimal']>;
};


export type DailyTotalTokensArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Token_Filter>;
};

export type DailyTotal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DailyTotal_Filter>>>;
  feesEth?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  feesEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_not?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  feesUsd?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  feesUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  numberOfTrades?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_gt?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_gte?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['BigInt']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_lte?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_not?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<DailyTotal_Filter>>>;
  orders?: InputMaybe<Scalars['BigInt']>;
  orders_gt?: InputMaybe<Scalars['BigInt']>;
  orders_gte?: InputMaybe<Scalars['BigInt']>;
  orders_in?: InputMaybe<Array<Scalars['BigInt']>>;
  orders_lt?: InputMaybe<Scalars['BigInt']>;
  orders_lte?: InputMaybe<Scalars['BigInt']>;
  orders_not?: InputMaybe<Scalars['BigInt']>;
  orders_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlements?: InputMaybe<Scalars['BigInt']>;
  settlements_gt?: InputMaybe<Scalars['BigInt']>;
  settlements_gte?: InputMaybe<Scalars['BigInt']>;
  settlements_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlements_lt?: InputMaybe<Scalars['BigInt']>;
  settlements_lte?: InputMaybe<Scalars['BigInt']>;
  settlements_not?: InputMaybe<Scalars['BigInt']>;
  settlements_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  tokens?: InputMaybe<Array<Scalars['String']>>;
  tokens_?: InputMaybe<Token_Filter>;
  tokens_contains?: InputMaybe<Array<Scalars['String']>>;
  tokens_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  tokens_not?: InputMaybe<Array<Scalars['String']>>;
  tokens_not_contains?: InputMaybe<Array<Scalars['String']>>;
  tokens_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  totalTokens?: InputMaybe<Scalars['BigInt']>;
  totalTokens_gt?: InputMaybe<Scalars['BigInt']>;
  totalTokens_gte?: InputMaybe<Scalars['BigInt']>;
  totalTokens_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalTokens_lt?: InputMaybe<Scalars['BigInt']>;
  totalTokens_lte?: InputMaybe<Scalars['BigInt']>;
  totalTokens_not?: InputMaybe<Scalars['BigInt']>;
  totalTokens_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeEth?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeUsd?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum DailyTotal_OrderBy {
  FeesEth = 'feesEth',
  FeesUsd = 'feesUsd',
  Id = 'id',
  NumberOfTrades = 'numberOfTrades',
  Orders = 'orders',
  Settlements = 'settlements',
  Timestamp = 'timestamp',
  Tokens = 'tokens',
  TotalTokens = 'totalTokens',
  VolumeEth = 'volumeEth',
  VolumeUsd = 'volumeUsd'
}

export type HourlyTotal = {
  __typename?: 'HourlyTotal';
  /** Total fees in Eth */
  feesEth?: Maybe<Scalars['BigDecimal']>;
  /** Total fees in USD */
  feesUsd?: Maybe<Scalars['BigDecimal']>;
  /** Hour timestamp */
  id: Scalars['ID'];
  /** Number of trades */
  numberOfTrades: Scalars['BigInt'];
  /** Total number of orders placed */
  orders: Scalars['BigInt'];
  /** Total number of batches settled */
  settlements: Scalars['BigInt'];
  /** Start hour timestamp */
  timestamp: Scalars['Int'];
  /** Traded tokens */
  tokens: Array<Token>;
  /** Total number of tokens traded */
  totalTokens: Scalars['BigInt'];
  /** Total traded volume in ETH */
  volumeEth?: Maybe<Scalars['BigDecimal']>;
  /** Total traded volume in USD */
  volumeUsd?: Maybe<Scalars['BigDecimal']>;
};


export type HourlyTotalTokensArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Token_Filter>;
};

export type HourlyTotal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<HourlyTotal_Filter>>>;
  feesEth?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  feesEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_not?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  feesUsd?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  feesUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  numberOfTrades?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_gt?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_gte?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['BigInt']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_lte?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_not?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<HourlyTotal_Filter>>>;
  orders?: InputMaybe<Scalars['BigInt']>;
  orders_gt?: InputMaybe<Scalars['BigInt']>;
  orders_gte?: InputMaybe<Scalars['BigInt']>;
  orders_in?: InputMaybe<Array<Scalars['BigInt']>>;
  orders_lt?: InputMaybe<Scalars['BigInt']>;
  orders_lte?: InputMaybe<Scalars['BigInt']>;
  orders_not?: InputMaybe<Scalars['BigInt']>;
  orders_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlements?: InputMaybe<Scalars['BigInt']>;
  settlements_gt?: InputMaybe<Scalars['BigInt']>;
  settlements_gte?: InputMaybe<Scalars['BigInt']>;
  settlements_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlements_lt?: InputMaybe<Scalars['BigInt']>;
  settlements_lte?: InputMaybe<Scalars['BigInt']>;
  settlements_not?: InputMaybe<Scalars['BigInt']>;
  settlements_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  tokens?: InputMaybe<Array<Scalars['String']>>;
  tokens_?: InputMaybe<Token_Filter>;
  tokens_contains?: InputMaybe<Array<Scalars['String']>>;
  tokens_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  tokens_not?: InputMaybe<Array<Scalars['String']>>;
  tokens_not_contains?: InputMaybe<Array<Scalars['String']>>;
  tokens_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  totalTokens?: InputMaybe<Scalars['BigInt']>;
  totalTokens_gt?: InputMaybe<Scalars['BigInt']>;
  totalTokens_gte?: InputMaybe<Scalars['BigInt']>;
  totalTokens_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalTokens_lt?: InputMaybe<Scalars['BigInt']>;
  totalTokens_lte?: InputMaybe<Scalars['BigInt']>;
  totalTokens_not?: InputMaybe<Scalars['BigInt']>;
  totalTokens_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeEth?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeUsd?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum HourlyTotal_OrderBy {
  FeesEth = 'feesEth',
  FeesUsd = 'feesUsd',
  Id = 'id',
  NumberOfTrades = 'numberOfTrades',
  Orders = 'orders',
  Settlements = 'settlements',
  Timestamp = 'timestamp',
  Tokens = 'tokens',
  TotalTokens = 'totalTokens',
  VolumeEth = 'volumeEth',
  VolumeUsd = 'volumeUsd'
}

export type Order = {
  __typename?: 'Order';
  /** Trade's OrderUid to hex string */
  id: Scalars['ID'];
  /** block's timestamp on invalidate event */
  invalidateTimestamp?: Maybe<Scalars['Int']>;
  /** Boolean value to show if the order is signed */
  isSigned?: Maybe<Scalars['Boolean']>;
  /** Boolean value true by default unless is invalidated by the event */
  isValid?: Maybe<Scalars['Boolean']>;
  /** Trade's owner or presign User */
  owner?: Maybe<User>;
  /** block's timestamp on presign event */
  presignTimestamp?: Maybe<Scalars['Int']>;
  /** Array of trades on the order */
  trades?: Maybe<Array<Trade>>;
  /** block's timestamp on trade event */
  tradesTimestamp?: Maybe<Scalars['Int']>;
};


export type OrderTradesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
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
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  invalidateTimestamp?: InputMaybe<Scalars['Int']>;
  invalidateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  invalidateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  invalidateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  invalidateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  invalidateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  invalidateTimestamp_not?: InputMaybe<Scalars['Int']>;
  invalidateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  isSigned?: InputMaybe<Scalars['Boolean']>;
  isSigned_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isSigned_not?: InputMaybe<Scalars['Boolean']>;
  isSigned_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isValid?: InputMaybe<Scalars['Boolean']>;
  isValid_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isValid_not?: InputMaybe<Scalars['Boolean']>;
  isValid_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  or?: InputMaybe<Array<InputMaybe<Order_Filter>>>;
  owner?: InputMaybe<Scalars['String']>;
  owner_?: InputMaybe<User_Filter>;
  owner_contains?: InputMaybe<Scalars['String']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']>;
  owner_ends_with?: InputMaybe<Scalars['String']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']>;
  owner_gt?: InputMaybe<Scalars['String']>;
  owner_gte?: InputMaybe<Scalars['String']>;
  owner_in?: InputMaybe<Array<Scalars['String']>>;
  owner_lt?: InputMaybe<Scalars['String']>;
  owner_lte?: InputMaybe<Scalars['String']>;
  owner_not?: InputMaybe<Scalars['String']>;
  owner_not_contains?: InputMaybe<Scalars['String']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  owner_starts_with?: InputMaybe<Scalars['String']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']>;
  presignTimestamp?: InputMaybe<Scalars['Int']>;
  presignTimestamp_gt?: InputMaybe<Scalars['Int']>;
  presignTimestamp_gte?: InputMaybe<Scalars['Int']>;
  presignTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  presignTimestamp_lt?: InputMaybe<Scalars['Int']>;
  presignTimestamp_lte?: InputMaybe<Scalars['Int']>;
  presignTimestamp_not?: InputMaybe<Scalars['Int']>;
  presignTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  tradesTimestamp?: InputMaybe<Scalars['Int']>;
  tradesTimestamp_gt?: InputMaybe<Scalars['Int']>;
  tradesTimestamp_gte?: InputMaybe<Scalars['Int']>;
  tradesTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  tradesTimestamp_lt?: InputMaybe<Scalars['Int']>;
  tradesTimestamp_lte?: InputMaybe<Scalars['Int']>;
  tradesTimestamp_not?: InputMaybe<Scalars['Int']>;
  tradesTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  id: Scalars['ID'];
  /** The token 0 address lower than token1 */
  token0: Token;
  /** Token0 last trade price */
  token0Price?: Maybe<Scalars['BigDecimal']>;
  /** Token 0 price expressed in token1 in the last trade */
  token0relativePrice?: Maybe<Scalars['BigDecimal']>;
  /** The token 1 address greater than token0 */
  token1: Token;
  /** Token1 last trade price */
  token1Price?: Maybe<Scalars['BigDecimal']>;
  /** Token 1 price expressed in token1 in the last trade */
  token1relativePrice?: Maybe<Scalars['BigDecimal']>;
  /** Total volume of token 0 traded */
  volumeToken0?: Maybe<Scalars['BigInt']>;
  /** Total volume of token 1 traded */
  volumeToken1?: Maybe<Scalars['BigInt']>;
  /** Total volume in Eth */
  volumeTradedEth?: Maybe<Scalars['BigDecimal']>;
  /** Total volume in Usd */
  volumeTradedUsd?: Maybe<Scalars['BigDecimal']>;
};

export type PairDaily = {
  __typename?: 'PairDaily';
  /** token0-token1-timestamp sorted by token0 < token1 */
  id: Scalars['ID'];
  /** Start day timestamp */
  timestamp: Scalars['Int'];
  /** The token 0 address lower than token1 */
  token0: Token;
  /** Token0 last trade price */
  token0Price?: Maybe<Scalars['BigDecimal']>;
  /** Token 0 price expressed in token1 in the last trade */
  token0relativePrice?: Maybe<Scalars['BigDecimal']>;
  /** The token 1 address greater than token0 */
  token1: Token;
  /** Token1 last trade price */
  token1Price?: Maybe<Scalars['BigDecimal']>;
  /** Token 1 price expressed in token1 in the last trade */
  token1relativePrice?: Maybe<Scalars['BigDecimal']>;
  /** Total volume of token 0 traded */
  volumeToken0?: Maybe<Scalars['BigInt']>;
  /** Total volume of token 1 traded */
  volumeToken1?: Maybe<Scalars['BigInt']>;
  /** Total volume in Eth */
  volumeTradedEth?: Maybe<Scalars['BigDecimal']>;
  /** Total volume in Usd */
  volumeTradedUsd?: Maybe<Scalars['BigDecimal']>;
};

export type PairDaily_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PairDaily_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<PairDaily_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  token0?: InputMaybe<Scalars['String']>;
  token0Price?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']>;
  token0_ends_with?: InputMaybe<Scalars['String']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token0_gt?: InputMaybe<Scalars['String']>;
  token0_gte?: InputMaybe<Scalars['String']>;
  token0_in?: InputMaybe<Array<Scalars['String']>>;
  token0_lt?: InputMaybe<Scalars['String']>;
  token0_lte?: InputMaybe<Scalars['String']>;
  token0_not?: InputMaybe<Scalars['String']>;
  token0_not_contains?: InputMaybe<Scalars['String']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token0_starts_with?: InputMaybe<Scalars['String']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token0relativePrice?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0relativePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1?: InputMaybe<Scalars['String']>;
  token1Price?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']>;
  token1_ends_with?: InputMaybe<Scalars['String']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token1_gt?: InputMaybe<Scalars['String']>;
  token1_gte?: InputMaybe<Scalars['String']>;
  token1_in?: InputMaybe<Array<Scalars['String']>>;
  token1_lt?: InputMaybe<Scalars['String']>;
  token1_lte?: InputMaybe<Scalars['String']>;
  token1_not?: InputMaybe<Scalars['String']>;
  token1_not_contains?: InputMaybe<Scalars['String']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token1_starts_with?: InputMaybe<Scalars['String']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token1relativePrice?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1relativePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeToken0?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeTradedEth?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeTradedEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeTradedUsd?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeTradedUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum PairDaily_OrderBy {
  Id = 'id',
  Timestamp = 'timestamp',
  Token0 = 'token0',
  Token0Price = 'token0Price',
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
  Token0relativePrice = 'token0relativePrice',
  Token1 = 'token1',
  Token1Price = 'token1Price',
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
  Token1relativePrice = 'token1relativePrice',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeTradedEth = 'volumeTradedEth',
  VolumeTradedUsd = 'volumeTradedUsd'
}

export type PairHourly = {
  __typename?: 'PairHourly';
  /** token0-token1-timestamp sorted by token0 < token1 */
  id: Scalars['ID'];
  /** Start hour timestamp */
  timestamp: Scalars['Int'];
  /** The token 0 address lower than token1 */
  token0: Token;
  /** Token0 last trade price */
  token0Price?: Maybe<Scalars['BigDecimal']>;
  /** Token 0 price expressed in token1 in the last trade */
  token0relativePrice?: Maybe<Scalars['BigDecimal']>;
  /** The token 1 address greater than token0 */
  token1: Token;
  /** Token1 last trade price */
  token1Price?: Maybe<Scalars['BigDecimal']>;
  /** Token 1 price expressed in token1 in the last trade */
  token1relativePrice?: Maybe<Scalars['BigDecimal']>;
  /** Total volume of token 0 traded */
  volumeToken0?: Maybe<Scalars['BigInt']>;
  /** Total volume of token 1 traded */
  volumeToken1?: Maybe<Scalars['BigInt']>;
  /** Total volume in Eth */
  volumeTradedEth?: Maybe<Scalars['BigDecimal']>;
  /** Total volume in Usd */
  volumeTradedUsd?: Maybe<Scalars['BigDecimal']>;
};

export type PairHourly_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PairHourly_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<PairHourly_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  token0?: InputMaybe<Scalars['String']>;
  token0Price?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']>;
  token0_ends_with?: InputMaybe<Scalars['String']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token0_gt?: InputMaybe<Scalars['String']>;
  token0_gte?: InputMaybe<Scalars['String']>;
  token0_in?: InputMaybe<Array<Scalars['String']>>;
  token0_lt?: InputMaybe<Scalars['String']>;
  token0_lte?: InputMaybe<Scalars['String']>;
  token0_not?: InputMaybe<Scalars['String']>;
  token0_not_contains?: InputMaybe<Scalars['String']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token0_starts_with?: InputMaybe<Scalars['String']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token0relativePrice?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0relativePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1?: InputMaybe<Scalars['String']>;
  token1Price?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']>;
  token1_ends_with?: InputMaybe<Scalars['String']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token1_gt?: InputMaybe<Scalars['String']>;
  token1_gte?: InputMaybe<Scalars['String']>;
  token1_in?: InputMaybe<Array<Scalars['String']>>;
  token1_lt?: InputMaybe<Scalars['String']>;
  token1_lte?: InputMaybe<Scalars['String']>;
  token1_not?: InputMaybe<Scalars['String']>;
  token1_not_contains?: InputMaybe<Scalars['String']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token1_starts_with?: InputMaybe<Scalars['String']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token1relativePrice?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1relativePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeToken0?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeTradedEth?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeTradedEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeTradedUsd?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeTradedUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum PairHourly_OrderBy {
  Id = 'id',
  Timestamp = 'timestamp',
  Token0 = 'token0',
  Token0Price = 'token0Price',
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
  Token0relativePrice = 'token0relativePrice',
  Token1 = 'token1',
  Token1Price = 'token1Price',
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
  Token1relativePrice = 'token1relativePrice',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeTradedEth = 'volumeTradedEth',
  VolumeTradedUsd = 'volumeTradedUsd'
}

export type Pair_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Pair_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Pair_Filter>>>;
  token0?: InputMaybe<Scalars['String']>;
  token0Price?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']>;
  token0_ends_with?: InputMaybe<Scalars['String']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token0_gt?: InputMaybe<Scalars['String']>;
  token0_gte?: InputMaybe<Scalars['String']>;
  token0_in?: InputMaybe<Array<Scalars['String']>>;
  token0_lt?: InputMaybe<Scalars['String']>;
  token0_lte?: InputMaybe<Scalars['String']>;
  token0_not?: InputMaybe<Scalars['String']>;
  token0_not_contains?: InputMaybe<Scalars['String']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token0_starts_with?: InputMaybe<Scalars['String']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token0relativePrice?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0relativePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  token0relativePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1?: InputMaybe<Scalars['String']>;
  token1Price?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']>;
  token1_ends_with?: InputMaybe<Scalars['String']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token1_gt?: InputMaybe<Scalars['String']>;
  token1_gte?: InputMaybe<Scalars['String']>;
  token1_in?: InputMaybe<Array<Scalars['String']>>;
  token1_lt?: InputMaybe<Scalars['String']>;
  token1_lte?: InputMaybe<Scalars['String']>;
  token1_not?: InputMaybe<Scalars['String']>;
  token1_not_contains?: InputMaybe<Scalars['String']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token1_starts_with?: InputMaybe<Scalars['String']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token1relativePrice?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1relativePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  token1relativePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeToken0?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeTradedEth?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeTradedEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeTradedUsd?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeTradedUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeTradedUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum Pair_OrderBy {
  Id = 'id',
  Token0 = 'token0',
  Token0Price = 'token0Price',
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
  Token0relativePrice = 'token0relativePrice',
  Token1 = 'token1',
  Token1Price = 'token1Price',
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
  Token1relativePrice = 'token1relativePrice',
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
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBundlesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Bundle_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Bundle_Filter>;
};


export type QueryDailyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDailyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DailyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DailyTotal_Filter>;
};


export type QueryHourlyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryHourlyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<HourlyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<HourlyTotal_Filter>;
};


export type QueryOrderArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryOrdersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Order_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Order_Filter>;
};


export type QueryPairArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPairDailiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PairDaily_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PairDaily_Filter>;
};


export type QueryPairDailyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPairHourliesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PairHourly_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PairHourly_Filter>;
};


export type QueryPairHourlyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPairsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Pair_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Pair_Filter>;
};


export type QuerySettlementArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerySettlementsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Settlement_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Settlement_Filter>;
};


export type QueryTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenDailyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenDailyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenDailyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenDailyTotal_Filter>;
};


export type QueryTokenHourlyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenHourlyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenHourlyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenHourlyTotal_Filter>;
};


export type QueryTokenTradingEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenTradingEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenTradingEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenTradingEvent_Filter>;
};


export type QueryTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token_Filter>;
};


export type QueryTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Total_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Total_Filter>;
};


export type QueryTradeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTradesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Trade_Filter>;
};


export type QueryUniswapPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUniswapPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UniswapPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UniswapPool_Filter>;
};


export type QueryUniswapTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUniswapTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UniswapToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UniswapToken_Filter>;
};


export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Settlement = {
  __typename?: 'Settlement';
  /** First trade timestamp */
  firstTradeTimestamp: Scalars['Int'];
  /** TxHash */
  id: Scalars['ID'];
  /** User who solved the settlement */
  solver?: Maybe<User>;
  /** Collection of trades */
  trades?: Maybe<Array<Trade>>;
  /** Transaction hash */
  txHash: Scalars['Bytes'];
};


export type SettlementTradesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Trade_Filter>;
};

export type Settlement_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Settlement_Filter>>>;
  firstTradeTimestamp?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstTradeTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Settlement_Filter>>>;
  solver?: InputMaybe<Scalars['String']>;
  solver_?: InputMaybe<User_Filter>;
  solver_contains?: InputMaybe<Scalars['String']>;
  solver_contains_nocase?: InputMaybe<Scalars['String']>;
  solver_ends_with?: InputMaybe<Scalars['String']>;
  solver_ends_with_nocase?: InputMaybe<Scalars['String']>;
  solver_gt?: InputMaybe<Scalars['String']>;
  solver_gte?: InputMaybe<Scalars['String']>;
  solver_in?: InputMaybe<Array<Scalars['String']>>;
  solver_lt?: InputMaybe<Scalars['String']>;
  solver_lte?: InputMaybe<Scalars['String']>;
  solver_not?: InputMaybe<Scalars['String']>;
  solver_not_contains?: InputMaybe<Scalars['String']>;
  solver_not_contains_nocase?: InputMaybe<Scalars['String']>;
  solver_not_ends_with?: InputMaybe<Scalars['String']>;
  solver_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  solver_not_in?: InputMaybe<Array<Scalars['String']>>;
  solver_not_starts_with?: InputMaybe<Scalars['String']>;
  solver_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  solver_starts_with?: InputMaybe<Scalars['String']>;
  solver_starts_with_nocase?: InputMaybe<Scalars['String']>;
  trades_?: InputMaybe<Trade_Filter>;
  txHash?: InputMaybe<Scalars['Bytes']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']>;
  txHash_not?: InputMaybe<Scalars['Bytes']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum Settlement_OrderBy {
  FirstTradeTimestamp = 'firstTradeTimestamp',
  Id = 'id',
  Solver = 'solver',
  SolverAddress = 'solver__address',
  SolverFirstTradeTimestamp = 'solver__firstTradeTimestamp',
  SolverId = 'solver__id',
  SolverIsSolver = 'solver__isSolver',
  SolverNumberOfTrades = 'solver__numberOfTrades',
  SolverSolvedAmountEth = 'solver__solvedAmountEth',
  SolverSolvedAmountUsd = 'solver__solvedAmountUsd',
  SolverTradedAmountEth = 'solver__tradedAmountEth',
  SolverTradedAmountUsd = 'solver__tradedAmountUsd',
  Trades = 'trades',
  TxHash = 'txHash'
}

export type Subscription = {
  __typename?: 'Subscription';
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


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionBundleArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionBundlesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Bundle_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Bundle_Filter>;
};


export type SubscriptionDailyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDailyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DailyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DailyTotal_Filter>;
};


export type SubscriptionHourlyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionHourlyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<HourlyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<HourlyTotal_Filter>;
};


export type SubscriptionOrderArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionOrdersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Order_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Order_Filter>;
};


export type SubscriptionPairArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPairDailiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PairDaily_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PairDaily_Filter>;
};


export type SubscriptionPairDailyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPairHourliesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PairHourly_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PairHourly_Filter>;
};


export type SubscriptionPairHourlyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPairsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Pair_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Pair_Filter>;
};


export type SubscriptionSettlementArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionSettlementsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Settlement_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Settlement_Filter>;
};


export type SubscriptionTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokenDailyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokenDailyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenDailyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenDailyTotal_Filter>;
};


export type SubscriptionTokenHourlyTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokenHourlyTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenHourlyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenHourlyTotal_Filter>;
};


export type SubscriptionTokenTradingEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokenTradingEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenTradingEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenTradingEvent_Filter>;
};


export type SubscriptionTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token_Filter>;
};


export type SubscriptionTotalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTotalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Total_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Total_Filter>;
};


export type SubscriptionTradeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTradesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Trade_Filter>;
};


export type SubscriptionUniswapPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUniswapPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UniswapPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UniswapPool_Filter>;
};


export type SubscriptionUniswapTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUniswapTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UniswapToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UniswapToken_Filter>;
};


export type SubscriptionUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Token = {
  __typename?: 'Token';
  /** Token address */
  address: Scalars['Bytes'];
  /** Daily totals */
  dailyTotals: Array<TokenDailyTotal>;
  /** Token decimals fetched by contract call */
  decimals: Scalars['Int'];
  /** First token trade block timestamp */
  firstTradeTimestamp: Scalars['Int'];
  /** History of trading for this token */
  history: Array<TokenTradingEvent>;
  /** Hourly totals */
  hourlyTotals: Array<TokenHourlyTotal>;
  /** Token address to hexString */
  id: Scalars['ID'];
  /** Token name fetched by ERC20 contract call */
  name: Scalars['String'];
  /** Total trades */
  numberOfTrades: Scalars['Int'];
  /** Derived price in ETH */
  priceEth?: Maybe<Scalars['BigDecimal']>;
  /** Derived price in USD */
  priceUsd?: Maybe<Scalars['BigDecimal']>;
  /** Token symbol fetched by contract call */
  symbol: Scalars['String'];
  /** Total volume managed in CowSwap */
  totalVolume?: Maybe<Scalars['BigInt']>;
  /** Total volume in Eth */
  totalVolumeEth: Scalars['BigDecimal'];
  /** Total volume in Usd */
  totalVolumeUsd: Scalars['BigDecimal'];
};


export type TokenDailyTotalsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenDailyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TokenDailyTotal_Filter>;
};


export type TokenHistoryArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenTradingEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TokenTradingEvent_Filter>;
};


export type TokenHourlyTotalsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenHourlyTotal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TokenHourlyTotal_Filter>;
};

export type TokenDailyTotal = {
  __typename?: 'TokenDailyTotal';
  /** Average trade price */
  averagePrice: Scalars['BigDecimal'];
  /** Last trade price */
  closePrice: Scalars['BigDecimal'];
  /** Higher trade price */
  higherPrice: Scalars['BigDecimal'];
  /** TokenAddress + timestamp day */
  id: Scalars['ID'];
  /** Lower trade price */
  lowerPrice: Scalars['BigDecimal'];
  /** First trade price */
  openPrice: Scalars['BigDecimal'];
  /** Start day timestamp */
  timestamp: Scalars['Int'];
  /** Token address */
  token: Token;
  /** Number of trades that day */
  totalTrades: Scalars['BigInt'];
  /** Total volume traded that day in token */
  totalVolume: Scalars['BigInt'];
  /** Total amount traded that day in ETH */
  totalVolumeEth: Scalars['BigDecimal'];
  /** Total amount traded that day in USD */
  totalVolumeUsd: Scalars['BigDecimal'];
};

export type TokenDailyTotal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenDailyTotal_Filter>>>;
  averagePrice?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  averagePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  closePrice?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  closePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  higherPrice?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  higherPrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_not?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lowerPrice?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  lowerPrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_not?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  openPrice?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  openPrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_not?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  or?: InputMaybe<Array<InputMaybe<TokenDailyTotal_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  token?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  totalTrades?: InputMaybe<Scalars['BigInt']>;
  totalTrades_gt?: InputMaybe<Scalars['BigInt']>;
  totalTrades_gte?: InputMaybe<Scalars['BigInt']>;
  totalTrades_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalTrades_lt?: InputMaybe<Scalars['BigInt']>;
  totalTrades_lte?: InputMaybe<Scalars['BigInt']>;
  totalTrades_not?: InputMaybe<Scalars['BigInt']>;
  totalTrades_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolume?: InputMaybe<Scalars['BigInt']>;
  totalVolumeEth?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumeEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_not?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUsd?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolume_gt?: InputMaybe<Scalars['BigInt']>;
  totalVolume_gte?: InputMaybe<Scalars['BigInt']>;
  totalVolume_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolume_lt?: InputMaybe<Scalars['BigInt']>;
  totalVolume_lte?: InputMaybe<Scalars['BigInt']>;
  totalVolume_not?: InputMaybe<Scalars['BigInt']>;
  totalVolume_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  averagePrice: Scalars['BigDecimal'];
  /** Last trade price */
  closePrice: Scalars['BigDecimal'];
  /** Higher trade price */
  higherPrice: Scalars['BigDecimal'];
  /** TokenAddress + timestamp hour */
  id: Scalars['ID'];
  /** Lower trade price */
  lowerPrice: Scalars['BigDecimal'];
  /** First trade price */
  openPrice: Scalars['BigDecimal'];
  /** Start hour timestamp */
  timestamp: Scalars['Int'];
  /** Token address */
  token: Token;
  /** Number of trades that hour */
  totalTrades: Scalars['BigInt'];
  /** Total volume traded that day in token */
  totalVolume: Scalars['BigInt'];
  /** Total amount traded that hour in ETH */
  totalVolumeEth: Scalars['BigDecimal'];
  /** Total amount traded that hour in USD */
  totalVolumeUsd: Scalars['BigDecimal'];
};

export type TokenHourlyTotal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenHourlyTotal_Filter>>>;
  averagePrice?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  averagePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  averagePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  closePrice?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  closePrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_not?: InputMaybe<Scalars['BigDecimal']>;
  closePrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  higherPrice?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  higherPrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_not?: InputMaybe<Scalars['BigDecimal']>;
  higherPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lowerPrice?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  lowerPrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_not?: InputMaybe<Scalars['BigDecimal']>;
  lowerPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  openPrice?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_gt?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_gte?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  openPrice_lt?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_lte?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_not?: InputMaybe<Scalars['BigDecimal']>;
  openPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  or?: InputMaybe<Array<InputMaybe<TokenHourlyTotal_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  token?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  totalTrades?: InputMaybe<Scalars['BigInt']>;
  totalTrades_gt?: InputMaybe<Scalars['BigInt']>;
  totalTrades_gte?: InputMaybe<Scalars['BigInt']>;
  totalTrades_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalTrades_lt?: InputMaybe<Scalars['BigInt']>;
  totalTrades_lte?: InputMaybe<Scalars['BigInt']>;
  totalTrades_not?: InputMaybe<Scalars['BigInt']>;
  totalTrades_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolume?: InputMaybe<Scalars['BigInt']>;
  totalVolumeEth?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumeEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_not?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUsd?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolume_gt?: InputMaybe<Scalars['BigInt']>;
  totalVolume_gte?: InputMaybe<Scalars['BigInt']>;
  totalVolume_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolume_lt?: InputMaybe<Scalars['BigInt']>;
  totalVolume_lte?: InputMaybe<Scalars['BigInt']>;
  totalVolume_not?: InputMaybe<Scalars['BigInt']>;
  totalVolume_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  amountEth: Scalars['BigDecimal'];
  /** Amount in Usd */
  amountUsd: Scalars['BigDecimal'];
  /** Id built using token-timestamp */
  id: Scalars['ID'];
  /** Timestamp */
  timestamp: Scalars['Int'];
  /** Token */
  token: Token;
  /** Trade */
  trade: Trade;
};

export type TokenTradingEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amountEth?: InputMaybe<Scalars['BigDecimal']>;
  amountEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  amountEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  amountEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  amountEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  amountEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  amountEth_not?: InputMaybe<Scalars['BigDecimal']>;
  amountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  amountUsd?: InputMaybe<Scalars['BigDecimal']>;
  amountUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  amountUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  amountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  amountUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  amountUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  amountUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  amountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  and?: InputMaybe<Array<InputMaybe<TokenTradingEvent_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<TokenTradingEvent_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  token?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  trade?: InputMaybe<Scalars['String']>;
  trade_?: InputMaybe<Trade_Filter>;
  trade_contains?: InputMaybe<Scalars['String']>;
  trade_contains_nocase?: InputMaybe<Scalars['String']>;
  trade_ends_with?: InputMaybe<Scalars['String']>;
  trade_ends_with_nocase?: InputMaybe<Scalars['String']>;
  trade_gt?: InputMaybe<Scalars['String']>;
  trade_gte?: InputMaybe<Scalars['String']>;
  trade_in?: InputMaybe<Array<Scalars['String']>>;
  trade_lt?: InputMaybe<Scalars['String']>;
  trade_lte?: InputMaybe<Scalars['String']>;
  trade_not?: InputMaybe<Scalars['String']>;
  trade_not_contains?: InputMaybe<Scalars['String']>;
  trade_not_contains_nocase?: InputMaybe<Scalars['String']>;
  trade_not_ends_with?: InputMaybe<Scalars['String']>;
  trade_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  trade_not_in?: InputMaybe<Array<Scalars['String']>>;
  trade_not_starts_with?: InputMaybe<Scalars['String']>;
  trade_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  trade_starts_with?: InputMaybe<Scalars['String']>;
  trade_starts_with_nocase?: InputMaybe<Scalars['String']>;
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
  TradeGasPrice = 'trade__gasPrice',
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
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_gt?: InputMaybe<Scalars['Bytes']>;
  address_gte?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_lt?: InputMaybe<Scalars['Bytes']>;
  address_lte?: InputMaybe<Scalars['Bytes']>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  and?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  dailyTotals_?: InputMaybe<TokenDailyTotal_Filter>;
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  firstTradeTimestamp?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstTradeTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  history_?: InputMaybe<TokenTradingEvent_Filter>;
  hourlyTotals_?: InputMaybe<TokenHourlyTotal_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  numberOfTrades?: InputMaybe<Scalars['Int']>;
  numberOfTrades_gt?: InputMaybe<Scalars['Int']>;
  numberOfTrades_gte?: InputMaybe<Scalars['Int']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['Int']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['Int']>;
  numberOfTrades_lte?: InputMaybe<Scalars['Int']>;
  numberOfTrades_not?: InputMaybe<Scalars['Int']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['Int']>>;
  or?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  priceEth?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  priceEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_not?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  priceUsd?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  priceUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  totalVolume?: InputMaybe<Scalars['BigInt']>;
  totalVolumeEth?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumeEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_not?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUsd?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  totalVolumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolume_gt?: InputMaybe<Scalars['BigInt']>;
  totalVolume_gte?: InputMaybe<Scalars['BigInt']>;
  totalVolume_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolume_lt?: InputMaybe<Scalars['BigInt']>;
  totalVolume_lte?: InputMaybe<Scalars['BigInt']>;
  totalVolume_not?: InputMaybe<Scalars['BigInt']>;
  totalVolume_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  feesEth?: Maybe<Scalars['BigDecimal']>;
  /** Total fees in USD */
  feesUsd?: Maybe<Scalars['BigDecimal']>;
  /** This is a singleton entity to contain accumulators for all values. Id will be always 1 */
  id: Scalars['ID'];
  /** Number of trades */
  numberOfTrades: Scalars['BigInt'];
  /** Total number of orders placed */
  orders: Scalars['BigInt'];
  /** Total number of batches settled */
  settlements: Scalars['BigInt'];
  /** Total number of tokens traded */
  tokens: Scalars['BigInt'];
  /** Total number of traders */
  traders: Scalars['BigInt'];
  /** Total traded volume in ETH */
  volumeEth?: Maybe<Scalars['BigDecimal']>;
  /** Total traded volume in USD */
  volumeUsd?: Maybe<Scalars['BigDecimal']>;
};

export type Total_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Total_Filter>>>;
  feesEth?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  feesEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_not?: InputMaybe<Scalars['BigDecimal']>;
  feesEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  feesUsd?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  feesUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  feesUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  numberOfTrades?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_gt?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_gte?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['BigInt']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_lte?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_not?: InputMaybe<Scalars['BigInt']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<Total_Filter>>>;
  orders?: InputMaybe<Scalars['BigInt']>;
  orders_gt?: InputMaybe<Scalars['BigInt']>;
  orders_gte?: InputMaybe<Scalars['BigInt']>;
  orders_in?: InputMaybe<Array<Scalars['BigInt']>>;
  orders_lt?: InputMaybe<Scalars['BigInt']>;
  orders_lte?: InputMaybe<Scalars['BigInt']>;
  orders_not?: InputMaybe<Scalars['BigInt']>;
  orders_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlements?: InputMaybe<Scalars['BigInt']>;
  settlements_gt?: InputMaybe<Scalars['BigInt']>;
  settlements_gte?: InputMaybe<Scalars['BigInt']>;
  settlements_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlements_lt?: InputMaybe<Scalars['BigInt']>;
  settlements_lte?: InputMaybe<Scalars['BigInt']>;
  settlements_not?: InputMaybe<Scalars['BigInt']>;
  settlements_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokens?: InputMaybe<Scalars['BigInt']>;
  tokens_gt?: InputMaybe<Scalars['BigInt']>;
  tokens_gte?: InputMaybe<Scalars['BigInt']>;
  tokens_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokens_lt?: InputMaybe<Scalars['BigInt']>;
  tokens_lte?: InputMaybe<Scalars['BigInt']>;
  tokens_not?: InputMaybe<Scalars['BigInt']>;
  tokens_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  traders?: InputMaybe<Scalars['BigInt']>;
  traders_gt?: InputMaybe<Scalars['BigInt']>;
  traders_gte?: InputMaybe<Scalars['BigInt']>;
  traders_in?: InputMaybe<Array<Scalars['BigInt']>>;
  traders_lt?: InputMaybe<Scalars['BigInt']>;
  traders_lte?: InputMaybe<Scalars['BigInt']>;
  traders_not?: InputMaybe<Scalars['BigInt']>;
  traders_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  volumeEth?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeUsd?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  volumeUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
  buyAmount: Scalars['BigInt'];
  /** Buy amount in Eth */
  buyAmountEth?: Maybe<Scalars['BigDecimal']>;
  /** Buy amount in Usd */
  buyAmountUsd?: Maybe<Scalars['BigDecimal']>;
  /** Trade event buyToken */
  buyToken: Token;
  /** Trade's fee amount */
  feeAmount: Scalars['BigInt'];
  /** Transaction's gas price */
  gasPrice: Scalars['BigInt'];
  /** This Id is composed using orderId|txHashString|eventIndex */
  id: Scalars['ID'];
  /** Order */
  order: Order;
  /** Trade event sellAmount */
  sellAmount: Scalars['BigInt'];
  /** Sell amount in Eth */
  sellAmountEth?: Maybe<Scalars['BigDecimal']>;
  /** Sell amount in Usd */
  sellAmountUsd?: Maybe<Scalars['BigDecimal']>;
  /** Trade event sellToken */
  sellToken: Token;
  /** Settlement */
  settlement: Settlement;
  /** Block's timestamp */
  timestamp: Scalars['Int'];
  /** Trade event transaction hash */
  txHash: Scalars['Bytes'];
};

export type Trade_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Trade_Filter>>>;
  buyAmount?: InputMaybe<Scalars['BigInt']>;
  buyAmountEth?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  buyAmountEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountEth_not?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  buyAmountUsd?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  buyAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  buyAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  buyAmount_gt?: InputMaybe<Scalars['BigInt']>;
  buyAmount_gte?: InputMaybe<Scalars['BigInt']>;
  buyAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  buyAmount_lt?: InputMaybe<Scalars['BigInt']>;
  buyAmount_lte?: InputMaybe<Scalars['BigInt']>;
  buyAmount_not?: InputMaybe<Scalars['BigInt']>;
  buyAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  buyToken?: InputMaybe<Scalars['String']>;
  buyToken_?: InputMaybe<Token_Filter>;
  buyToken_contains?: InputMaybe<Scalars['String']>;
  buyToken_contains_nocase?: InputMaybe<Scalars['String']>;
  buyToken_ends_with?: InputMaybe<Scalars['String']>;
  buyToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  buyToken_gt?: InputMaybe<Scalars['String']>;
  buyToken_gte?: InputMaybe<Scalars['String']>;
  buyToken_in?: InputMaybe<Array<Scalars['String']>>;
  buyToken_lt?: InputMaybe<Scalars['String']>;
  buyToken_lte?: InputMaybe<Scalars['String']>;
  buyToken_not?: InputMaybe<Scalars['String']>;
  buyToken_not_contains?: InputMaybe<Scalars['String']>;
  buyToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  buyToken_not_ends_with?: InputMaybe<Scalars['String']>;
  buyToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  buyToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  buyToken_not_starts_with?: InputMaybe<Scalars['String']>;
  buyToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  buyToken_starts_with?: InputMaybe<Scalars['String']>;
  buyToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  feeAmount?: InputMaybe<Scalars['BigInt']>;
  feeAmount_gt?: InputMaybe<Scalars['BigInt']>;
  feeAmount_gte?: InputMaybe<Scalars['BigInt']>;
  feeAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  feeAmount_lt?: InputMaybe<Scalars['BigInt']>;
  feeAmount_lte?: InputMaybe<Scalars['BigInt']>;
  feeAmount_not?: InputMaybe<Scalars['BigInt']>;
  feeAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Trade_Filter>>>;
  order?: InputMaybe<Scalars['String']>;
  order_?: InputMaybe<Order_Filter>;
  order_contains?: InputMaybe<Scalars['String']>;
  order_contains_nocase?: InputMaybe<Scalars['String']>;
  order_ends_with?: InputMaybe<Scalars['String']>;
  order_ends_with_nocase?: InputMaybe<Scalars['String']>;
  order_gt?: InputMaybe<Scalars['String']>;
  order_gte?: InputMaybe<Scalars['String']>;
  order_in?: InputMaybe<Array<Scalars['String']>>;
  order_lt?: InputMaybe<Scalars['String']>;
  order_lte?: InputMaybe<Scalars['String']>;
  order_not?: InputMaybe<Scalars['String']>;
  order_not_contains?: InputMaybe<Scalars['String']>;
  order_not_contains_nocase?: InputMaybe<Scalars['String']>;
  order_not_ends_with?: InputMaybe<Scalars['String']>;
  order_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  order_not_in?: InputMaybe<Array<Scalars['String']>>;
  order_not_starts_with?: InputMaybe<Scalars['String']>;
  order_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  order_starts_with?: InputMaybe<Scalars['String']>;
  order_starts_with_nocase?: InputMaybe<Scalars['String']>;
  sellAmount?: InputMaybe<Scalars['BigInt']>;
  sellAmountEth?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  sellAmountEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountEth_not?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  sellAmountUsd?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  sellAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  sellAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  sellAmount_gt?: InputMaybe<Scalars['BigInt']>;
  sellAmount_gte?: InputMaybe<Scalars['BigInt']>;
  sellAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sellAmount_lt?: InputMaybe<Scalars['BigInt']>;
  sellAmount_lte?: InputMaybe<Scalars['BigInt']>;
  sellAmount_not?: InputMaybe<Scalars['BigInt']>;
  sellAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sellToken?: InputMaybe<Scalars['String']>;
  sellToken_?: InputMaybe<Token_Filter>;
  sellToken_contains?: InputMaybe<Scalars['String']>;
  sellToken_contains_nocase?: InputMaybe<Scalars['String']>;
  sellToken_ends_with?: InputMaybe<Scalars['String']>;
  sellToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  sellToken_gt?: InputMaybe<Scalars['String']>;
  sellToken_gte?: InputMaybe<Scalars['String']>;
  sellToken_in?: InputMaybe<Array<Scalars['String']>>;
  sellToken_lt?: InputMaybe<Scalars['String']>;
  sellToken_lte?: InputMaybe<Scalars['String']>;
  sellToken_not?: InputMaybe<Scalars['String']>;
  sellToken_not_contains?: InputMaybe<Scalars['String']>;
  sellToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  sellToken_not_ends_with?: InputMaybe<Scalars['String']>;
  sellToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  sellToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  sellToken_not_starts_with?: InputMaybe<Scalars['String']>;
  sellToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  sellToken_starts_with?: InputMaybe<Scalars['String']>;
  sellToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  settlement?: InputMaybe<Scalars['String']>;
  settlement_?: InputMaybe<Settlement_Filter>;
  settlement_contains?: InputMaybe<Scalars['String']>;
  settlement_contains_nocase?: InputMaybe<Scalars['String']>;
  settlement_ends_with?: InputMaybe<Scalars['String']>;
  settlement_ends_with_nocase?: InputMaybe<Scalars['String']>;
  settlement_gt?: InputMaybe<Scalars['String']>;
  settlement_gte?: InputMaybe<Scalars['String']>;
  settlement_in?: InputMaybe<Array<Scalars['String']>>;
  settlement_lt?: InputMaybe<Scalars['String']>;
  settlement_lte?: InputMaybe<Scalars['String']>;
  settlement_not?: InputMaybe<Scalars['String']>;
  settlement_not_contains?: InputMaybe<Scalars['String']>;
  settlement_not_contains_nocase?: InputMaybe<Scalars['String']>;
  settlement_not_ends_with?: InputMaybe<Scalars['String']>;
  settlement_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  settlement_not_in?: InputMaybe<Array<Scalars['String']>>;
  settlement_not_starts_with?: InputMaybe<Scalars['String']>;
  settlement_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  settlement_starts_with?: InputMaybe<Scalars['String']>;
  settlement_starts_with_nocase?: InputMaybe<Scalars['String']>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  txHash?: InputMaybe<Scalars['Bytes']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']>;
  txHash_not?: InputMaybe<Scalars['Bytes']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
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
  GasPrice = 'gasPrice',
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
  SettlementFirstTradeTimestamp = 'settlement__firstTradeTimestamp',
  SettlementId = 'settlement__id',
  SettlementTxHash = 'settlement__txHash',
  Timestamp = 'timestamp',
  TxHash = 'txHash'
}

export type UniswapPool = {
  __typename?: 'UniswapPool';
  /** Pool address */
  id: Scalars['ID'];
  /** In range liquidity */
  liquidity: Scalars['BigInt'];
  /** Current tick */
  tick?: Maybe<Scalars['BigInt']>;
  /** Token0 */
  token0: UniswapToken;
  /** Token0 per token1 */
  token0Price: Scalars['BigDecimal'];
  /** Token1 */
  token1: UniswapToken;
  /** Token1 per token0 */
  token1Price: Scalars['BigDecimal'];
  /** Total token 0 across all ticks */
  totalValueLockedToken0: Scalars['BigDecimal'];
  /** Total token 1 across all ticks */
  totalValueLockedToken1: Scalars['BigDecimal'];
};

export type UniswapPool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<UniswapPool_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  liquidity?: InputMaybe<Scalars['BigInt']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<UniswapPool_Filter>>>;
  tick?: InputMaybe<Scalars['BigInt']>;
  tick_gt?: InputMaybe<Scalars['BigInt']>;
  tick_gte?: InputMaybe<Scalars['BigInt']>;
  tick_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tick_lt?: InputMaybe<Scalars['BigInt']>;
  tick_lte?: InputMaybe<Scalars['BigInt']>;
  tick_not?: InputMaybe<Scalars['BigInt']>;
  tick_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  token0?: InputMaybe<Scalars['String']>;
  token0Price?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token0_?: InputMaybe<UniswapToken_Filter>;
  token0_contains?: InputMaybe<Scalars['String']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']>;
  token0_ends_with?: InputMaybe<Scalars['String']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token0_gt?: InputMaybe<Scalars['String']>;
  token0_gte?: InputMaybe<Scalars['String']>;
  token0_in?: InputMaybe<Array<Scalars['String']>>;
  token0_lt?: InputMaybe<Scalars['String']>;
  token0_lte?: InputMaybe<Scalars['String']>;
  token0_not?: InputMaybe<Scalars['String']>;
  token0_not_contains?: InputMaybe<Scalars['String']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token0_starts_with?: InputMaybe<Scalars['String']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token1?: InputMaybe<Scalars['String']>;
  token1Price?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  token1_?: InputMaybe<UniswapToken_Filter>;
  token1_contains?: InputMaybe<Scalars['String']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']>;
  token1_ends_with?: InputMaybe<Scalars['String']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token1_gt?: InputMaybe<Scalars['String']>;
  token1_gte?: InputMaybe<Scalars['String']>;
  token1_in?: InputMaybe<Array<Scalars['String']>>;
  token1_lt?: InputMaybe<Scalars['String']>;
  token1_lte?: InputMaybe<Scalars['String']>;
  token1_not?: InputMaybe<Scalars['String']>;
  token1_not_contains?: InputMaybe<Scalars['String']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token1_starts_with?: InputMaybe<Scalars['String']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']>;
  totalValueLockedToken0?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedToken0_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_not?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedToken1?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedToken1_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_not?: InputMaybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
  address: Scalars['Bytes'];
  /** Pools token is in that are allow listed for USD pricing */
  allowedPools: Array<UniswapToken>;
  /** Token decimals fetched by contract call */
  decimals: Scalars['Int'];
  /** Token address to hexString */
  id: Scalars['ID'];
  /** Token name fetched by ERC20 contract call */
  name: Scalars['String'];
  /** Derived price in ETH */
  priceEth?: Maybe<Scalars['BigDecimal']>;
  /** Derived price in USD */
  priceUsd?: Maybe<Scalars['BigDecimal']>;
  /** Token symbol fetched by contract call */
  symbol: Scalars['String'];
};


export type UniswapTokenAllowedPoolsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UniswapToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<UniswapToken_Filter>;
};

export type UniswapToken_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_gt?: InputMaybe<Scalars['Bytes']>;
  address_gte?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_lt?: InputMaybe<Scalars['Bytes']>;
  address_lte?: InputMaybe<Scalars['Bytes']>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  allowedPools?: InputMaybe<Array<Scalars['String']>>;
  allowedPools_?: InputMaybe<UniswapToken_Filter>;
  allowedPools_contains?: InputMaybe<Array<Scalars['String']>>;
  allowedPools_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  allowedPools_not?: InputMaybe<Array<Scalars['String']>>;
  allowedPools_not_contains?: InputMaybe<Array<Scalars['String']>>;
  allowedPools_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  and?: InputMaybe<Array<InputMaybe<UniswapToken_Filter>>>;
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<UniswapToken_Filter>>>;
  priceEth?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  priceEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_not?: InputMaybe<Scalars['BigDecimal']>;
  priceEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  priceUsd?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  priceUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  priceUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
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
  address: Scalars['Bytes'];
  /** First trade block timestamp */
  firstTradeTimestamp: Scalars['Int'];
  /** Trade event order owner */
  id: Scalars['ID'];
  /** Determine if user has solved a settlement */
  isSolver: Scalars['Boolean'];
  /** Solved trades */
  numberOfTrades: Scalars['Int'];
  /** List of orders placed by this user */
  ordersPlaced: Array<Order>;
  /** total amount solved by the user in Eth */
  solvedAmountEth?: Maybe<Scalars['BigDecimal']>;
  /** total amount solved by the user in Usd */
  solvedAmountUsd?: Maybe<Scalars['BigDecimal']>;
  /** total amount traded by the user in Eth */
  tradedAmountEth?: Maybe<Scalars['BigDecimal']>;
  /** total amount traded by the user in Usd */
  tradedAmountUsd?: Maybe<Scalars['BigDecimal']>;
};


export type UserOrdersPlacedArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Order_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Order_Filter>;
};

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_gt?: InputMaybe<Scalars['Bytes']>;
  address_gte?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_lt?: InputMaybe<Scalars['Bytes']>;
  address_lte?: InputMaybe<Scalars['Bytes']>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  firstTradeTimestamp?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstTradeTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstTradeTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  isSolver?: InputMaybe<Scalars['Boolean']>;
  isSolver_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isSolver_not?: InputMaybe<Scalars['Boolean']>;
  isSolver_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  numberOfTrades?: InputMaybe<Scalars['Int']>;
  numberOfTrades_gt?: InputMaybe<Scalars['Int']>;
  numberOfTrades_gte?: InputMaybe<Scalars['Int']>;
  numberOfTrades_in?: InputMaybe<Array<Scalars['Int']>>;
  numberOfTrades_lt?: InputMaybe<Scalars['Int']>;
  numberOfTrades_lte?: InputMaybe<Scalars['Int']>;
  numberOfTrades_not?: InputMaybe<Scalars['Int']>;
  numberOfTrades_not_in?: InputMaybe<Array<Scalars['Int']>>;
  or?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  ordersPlaced_?: InputMaybe<Order_Filter>;
  solvedAmountEth?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  solvedAmountEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountEth_not?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  solvedAmountUsd?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  solvedAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  solvedAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  tradedAmountEth?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  tradedAmountEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountEth_not?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  tradedAmountUsd?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  tradedAmountUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  tradedAmountUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum User_OrderBy {
  Address = 'address',
  FirstTradeTimestamp = 'firstTradeTimestamp',
  Id = 'id',
  IsSolver = 'isSolver',
  NumberOfTrades = 'numberOfTrades',
  OrdersPlaced = 'ordersPlaced',
  SolvedAmountEth = 'solvedAmountEth',
  SolvedAmountUsd = 'solvedAmountUsd',
  TradedAmountEth = 'tradedAmountEth',
  TradedAmountUsd = 'tradedAmountUsd'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
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
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
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
  days: Scalars['Int'];
}>;


export type LastDaysVolumeQuery = { __typename?: 'Query', dailyTotals: Array<{ __typename?: 'DailyTotal', timestamp: number, volumeUsd?: any | null }> };

export type LastHoursVolumeQueryVariables = Exact<{
  hours: Scalars['Int'];
}>;


export type LastHoursVolumeQuery = { __typename?: 'Query', hourlyTotals: Array<{ __typename?: 'HourlyTotal', timestamp: number, volumeUsd?: any | null }> };
