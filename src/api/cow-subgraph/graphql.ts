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
};

/** The block at which the query should be executed. */
export type Block_Height = {
  /** Value containing a block hash */
  hash?: InputMaybe<Scalars['Bytes']>;
  /** Value containing a block number */
  number?: InputMaybe<Scalars['Int']>;
  /**
   * Value containing the minimum block number.
   * In the case of `number_gte`, the query will be executed on the latest block only if
   * the subgraph has progressed to or past the minimum block number.
   * Defaults to the latest block when omitted.
   *
   */
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type DailyTotal = {
  __typename?: 'DailyTotal';
  /** Total fees in Eth */
  feesEth?: Maybe<Scalars['BigDecimal']>;
  /** Total fees in USD */
  feesUsd?: Maybe<Scalars['BigDecimal']>;
  /** Day timestamp */
  id: Scalars['ID'];
  /** Total number of orders placed */
  orders: Scalars['BigInt'];
  /** Total number of batches settled */
  settlements: Scalars['BigInt'];
  /** Start day timestamp */
  timestamp: Scalars['BigInt'];
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
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokens?: InputMaybe<Array<Scalars['String']>>;
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
  /** Total number of orders placed */
  orders: Scalars['BigInt'];
  /** Total number of batches settled */
  settlements: Scalars['BigInt'];
  /** Start hour timestamp */
  timestamp: Scalars['BigInt'];
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
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokens?: InputMaybe<Array<Scalars['String']>>;
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
  invalidateTimestamp?: Maybe<Scalars['BigInt']>;
  /** Boolean value true by default unless is invalidated by the event */
  isValid: Scalars['Boolean'];
  /** Trade's owner or presign User */
  owner?: Maybe<User>;
  /** block's timestamp on presign event */
  presignTimestamp?: Maybe<Scalars['BigInt']>;
  /** block's timestamp on trade event */
  tradeTimestamp?: Maybe<Scalars['BigInt']>;
  /** Array of trades on the order */
  trades?: Maybe<Array<Trade>>;
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
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  invalidateTimestamp?: InputMaybe<Scalars['BigInt']>;
  invalidateTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  invalidateTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  invalidateTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  invalidateTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  invalidateTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  invalidateTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  invalidateTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  isValid?: InputMaybe<Scalars['Boolean']>;
  isValid_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isValid_not?: InputMaybe<Scalars['Boolean']>;
  isValid_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  owner?: InputMaybe<Scalars['String']>;
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
  presignTimestamp?: InputMaybe<Scalars['BigInt']>;
  presignTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  presignTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  presignTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  presignTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  presignTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  presignTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  presignTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tradeTimestamp?: InputMaybe<Scalars['BigInt']>;
  tradeTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  tradeTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  tradeTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tradeTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  tradeTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  tradeTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  tradeTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Order_OrderBy {
  Id = 'id',
  InvalidateTimestamp = 'invalidateTimestamp',
  IsValid = 'isValid',
  Owner = 'owner',
  PresignTimestamp = 'presignTimestamp',
  TradeTimestamp = 'tradeTimestamp',
  Trades = 'trades'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  dailyTotal?: Maybe<DailyTotal>;
  dailyTotals: Array<DailyTotal>;
  hourlyTotal?: Maybe<HourlyTotal>;
  hourlyTotals: Array<HourlyTotal>;
  order?: Maybe<Order>;
  orders: Array<Order>;
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
  user?: Maybe<User>;
  users: Array<User>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
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
  /** TxHash */
  id: Scalars['ID'];
  /** User who solved the settlement */
  solver?: Maybe<User>;
  /** First trade timestamp */
  timestamp: Scalars['BigInt'];
  /** Collection of trades */
  trades?: Maybe<Array<Trade>>;
  /** Transaction cost in Eth */
  txCostEth: Scalars['BigDecimal'];
  /** Transaction cost in USD */
  txCostUsd: Scalars['BigDecimal'];
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
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  solver?: InputMaybe<Scalars['String']>;
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
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  txCostEth?: InputMaybe<Scalars['BigDecimal']>;
  txCostEth_gt?: InputMaybe<Scalars['BigDecimal']>;
  txCostEth_gte?: InputMaybe<Scalars['BigDecimal']>;
  txCostEth_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  txCostEth_lt?: InputMaybe<Scalars['BigDecimal']>;
  txCostEth_lte?: InputMaybe<Scalars['BigDecimal']>;
  txCostEth_not?: InputMaybe<Scalars['BigDecimal']>;
  txCostEth_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  txCostUsd?: InputMaybe<Scalars['BigDecimal']>;
  txCostUsd_gt?: InputMaybe<Scalars['BigDecimal']>;
  txCostUsd_gte?: InputMaybe<Scalars['BigDecimal']>;
  txCostUsd_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  txCostUsd_lt?: InputMaybe<Scalars['BigDecimal']>;
  txCostUsd_lte?: InputMaybe<Scalars['BigDecimal']>;
  txCostUsd_not?: InputMaybe<Scalars['BigDecimal']>;
  txCostUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  txHash?: InputMaybe<Scalars['Bytes']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  txHash_not?: InputMaybe<Scalars['Bytes']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum Settlement_OrderBy {
  Id = 'id',
  Solver = 'solver',
  Timestamp = 'timestamp',
  Trades = 'trades',
  TxCostEth = 'txCostEth',
  TxCostUsd = 'txCostUsd',
  TxHash = 'txHash'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  dailyTotal?: Maybe<DailyTotal>;
  dailyTotals: Array<DailyTotal>;
  hourlyTotal?: Maybe<HourlyTotal>;
  hourlyTotals: Array<HourlyTotal>;
  order?: Maybe<Order>;
  orders: Array<Order>;
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
  user?: Maybe<User>;
  users: Array<User>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
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
  /** Token decimals fetched by contract call */
  decimals: Scalars['Int'];
  /** First token trade block timestamp */
  firstTradeTimestamp: Scalars['BigInt'];
  /** History of trading for this token */
  history: Array<TokenTradingEvent>;
  /** Token address to hexString */
  id: Scalars['ID'];
  /** Token name fetched by ERC20 contract call */
  name: Scalars['String'];
  /** Total trades */
  numberOfTrades: Scalars['Int'];
  /** Estimated token price in ETH */
  priceETH: Scalars['BigDecimal'];
  /** Estimated token price in USD */
  priceUSD: Scalars['BigDecimal'];
  /** Token symbol fetched by contract call */
  symbol: Scalars['String'];
  /** Total volume in Eth */
  totalVolumeEth?: Maybe<Scalars['BigDecimal']>;
  /** Total volume in Usd */
  totalVolumeUsd?: Maybe<Scalars['BigDecimal']>;
};


export type TokenHistoryArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenTradingEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TokenTradingEvent_Filter>;
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
  timestamp: Scalars['BigInt'];
  /** Token address */
  token: Token;
  /** Number of trades that day */
  totalTrades: Scalars['BigInt'];
  /** Total volume traded that day in token */
  totalVolume: Scalars['BigDecimal'];
  /** Total amount traded that day in ETH */
  totalVolumeEth: Scalars['BigDecimal'];
  /** Total amount traded that day in USD */
  totalVolumeUsd: Scalars['BigDecimal'];
};

export type TokenDailyTotal_Filter = {
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
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  token?: InputMaybe<Scalars['String']>;
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
  totalVolume?: InputMaybe<Scalars['BigDecimal']>;
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
  totalVolume_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolume_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_not?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
  timestamp: Scalars['BigInt'];
  /** Token address */
  token: Token;
  /** Number of trades that hour */
  totalTrades: Scalars['BigInt'];
  /** Total volume traded that day in token */
  totalVolume: Scalars['BigDecimal'];
  /** Total amount traded that hour in ETH */
  totalVolumeEth: Scalars['BigDecimal'];
  /** Total amount traded that hour in USD */
  totalVolumeUsd: Scalars['BigDecimal'];
};

export type TokenHourlyTotal_Filter = {
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
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  token?: InputMaybe<Scalars['String']>;
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
  totalVolume?: InputMaybe<Scalars['BigDecimal']>;
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
  totalVolume_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolume_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_not?: InputMaybe<Scalars['BigDecimal']>;
  totalVolume_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
  timestamp: Scalars['BigInt'];
  /** Token */
  token: Token;
  /** Trade */
  trade: Trade;
};

export type TokenTradingEvent_Filter = {
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
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  token?: InputMaybe<Scalars['String']>;
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
  Trade = 'trade'
}

export type Token_Filter = {
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  firstTradeTimestamp?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstTradeTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  history?: InputMaybe<Array<Scalars['String']>>;
  history_contains?: InputMaybe<Array<Scalars['String']>>;
  history_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  history_not?: InputMaybe<Array<Scalars['String']>>;
  history_not_contains?: InputMaybe<Array<Scalars['String']>>;
  history_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
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
  priceETH?: InputMaybe<Scalars['BigDecimal']>;
  priceETH_gt?: InputMaybe<Scalars['BigDecimal']>;
  priceETH_gte?: InputMaybe<Scalars['BigDecimal']>;
  priceETH_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  priceETH_lt?: InputMaybe<Scalars['BigDecimal']>;
  priceETH_lte?: InputMaybe<Scalars['BigDecimal']>;
  priceETH_not?: InputMaybe<Scalars['BigDecimal']>;
  priceETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  priceUSD?: InputMaybe<Scalars['BigDecimal']>;
  priceUSD_gt?: InputMaybe<Scalars['BigDecimal']>;
  priceUSD_gte?: InputMaybe<Scalars['BigDecimal']>;
  priceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  priceUSD_lt?: InputMaybe<Scalars['BigDecimal']>;
  priceUSD_lte?: InputMaybe<Scalars['BigDecimal']>;
  priceUSD_not?: InputMaybe<Scalars['BigDecimal']>;
  priceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
};

export enum Token_OrderBy {
  Address = 'address',
  Decimals = 'decimals',
  FirstTradeTimestamp = 'firstTradeTimestamp',
  History = 'history',
  Id = 'id',
  Name = 'name',
  NumberOfTrades = 'numberOfTrades',
  PriceEth = 'priceETH',
  PriceUsd = 'priceUSD',
  Symbol = 'symbol',
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
  /** Transaction's gas limit */
  gasLimit: Scalars['BigInt'];
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
  timestamp: Scalars['BigInt'];
  /** Trade event transaction hash */
  txHash: Scalars['Bytes'];
};

export type Trade_Filter = {
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
  gasLimit?: InputMaybe<Scalars['BigInt']>;
  gasLimit_gt?: InputMaybe<Scalars['BigInt']>;
  gasLimit_gte?: InputMaybe<Scalars['BigInt']>;
  gasLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasLimit_lt?: InputMaybe<Scalars['BigInt']>;
  gasLimit_lte?: InputMaybe<Scalars['BigInt']>;
  gasLimit_not?: InputMaybe<Scalars['BigInt']>;
  gasLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  order?: InputMaybe<Scalars['String']>;
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
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  txHash?: InputMaybe<Scalars['Bytes']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  txHash_not?: InputMaybe<Scalars['Bytes']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum Trade_OrderBy {
  BuyAmount = 'buyAmount',
  BuyAmountEth = 'buyAmountEth',
  BuyAmountUsd = 'buyAmountUsd',
  BuyToken = 'buyToken',
  FeeAmount = 'feeAmount',
  GasLimit = 'gasLimit',
  GasPrice = 'gasPrice',
  Id = 'id',
  Order = 'order',
  SellAmount = 'sellAmount',
  SellAmountEth = 'sellAmountEth',
  SellAmountUsd = 'sellAmountUsd',
  SellToken = 'sellToken',
  Settlement = 'settlement',
  Timestamp = 'timestamp',
  TxHash = 'txHash'
}

export type User = {
  __typename?: 'User';
  /** Owner's address */
  address: Scalars['Bytes'];
  /** First trade block timestamp */
  firstTradeTimestamp: Scalars['BigInt'];
  /** Trade event order owner */
  id: Scalars['ID'];
  /** isSolver */
  isSolver?: Maybe<Scalars['Boolean']>;
  /** solvedAmount */
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
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstTradeTimestamp?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstTradeTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  firstTradeTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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


export type LastDaysVolumeQuery = { __typename?: 'Query', dailyTotals: Array<{ __typename?: 'DailyTotal', timestamp: any, volumeUsd?: any | null }> };

export type LastHoursVolumeQueryVariables = Exact<{
  hours: Scalars['Int'];
}>;


export type LastHoursVolumeQuery = { __typename?: 'Query', hourlyTotals: Array<{ __typename?: 'HourlyTotal', timestamp: any, volumeUsd?: any | null }> };
