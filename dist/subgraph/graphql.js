"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._SubgraphErrorPolicy_ = exports.User_OrderBy = exports.UniswapToken_OrderBy = exports.UniswapPool_OrderBy = exports.Trade_OrderBy = exports.Total_OrderBy = exports.Token_OrderBy = exports.TokenTradingEvent_OrderBy = exports.TokenHourlyTotal_OrderBy = exports.TokenDailyTotal_OrderBy = exports.Settlement_OrderBy = exports.Pair_OrderBy = exports.PairHourly_OrderBy = exports.PairDaily_OrderBy = exports.Order_OrderBy = exports.OrderDirection = exports.HourlyTotal_OrderBy = exports.DailyTotal_OrderBy = exports.Bundle_OrderBy = void 0;
var Bundle_OrderBy;
(function (Bundle_OrderBy) {
    Bundle_OrderBy["EthPriceUsd"] = "ethPriceUSD";
    Bundle_OrderBy["Id"] = "id";
})(Bundle_OrderBy = exports.Bundle_OrderBy || (exports.Bundle_OrderBy = {}));
var DailyTotal_OrderBy;
(function (DailyTotal_OrderBy) {
    DailyTotal_OrderBy["FeesEth"] = "feesEth";
    DailyTotal_OrderBy["FeesUsd"] = "feesUsd";
    DailyTotal_OrderBy["Id"] = "id";
    DailyTotal_OrderBy["NumberOfTrades"] = "numberOfTrades";
    DailyTotal_OrderBy["Orders"] = "orders";
    DailyTotal_OrderBy["Settlements"] = "settlements";
    DailyTotal_OrderBy["Timestamp"] = "timestamp";
    DailyTotal_OrderBy["Tokens"] = "tokens";
    DailyTotal_OrderBy["TotalTokens"] = "totalTokens";
    DailyTotal_OrderBy["VolumeEth"] = "volumeEth";
    DailyTotal_OrderBy["VolumeUsd"] = "volumeUsd";
})(DailyTotal_OrderBy = exports.DailyTotal_OrderBy || (exports.DailyTotal_OrderBy = {}));
var HourlyTotal_OrderBy;
(function (HourlyTotal_OrderBy) {
    HourlyTotal_OrderBy["FeesEth"] = "feesEth";
    HourlyTotal_OrderBy["FeesUsd"] = "feesUsd";
    HourlyTotal_OrderBy["Id"] = "id";
    HourlyTotal_OrderBy["NumberOfTrades"] = "numberOfTrades";
    HourlyTotal_OrderBy["Orders"] = "orders";
    HourlyTotal_OrderBy["Settlements"] = "settlements";
    HourlyTotal_OrderBy["Timestamp"] = "timestamp";
    HourlyTotal_OrderBy["Tokens"] = "tokens";
    HourlyTotal_OrderBy["TotalTokens"] = "totalTokens";
    HourlyTotal_OrderBy["VolumeEth"] = "volumeEth";
    HourlyTotal_OrderBy["VolumeUsd"] = "volumeUsd";
})(HourlyTotal_OrderBy = exports.HourlyTotal_OrderBy || (exports.HourlyTotal_OrderBy = {}));
/** Defines the order direction, either ascending or descending */
var OrderDirection;
(function (OrderDirection) {
    OrderDirection["Asc"] = "asc";
    OrderDirection["Desc"] = "desc";
})(OrderDirection = exports.OrderDirection || (exports.OrderDirection = {}));
var Order_OrderBy;
(function (Order_OrderBy) {
    Order_OrderBy["Id"] = "id";
    Order_OrderBy["InvalidateTimestamp"] = "invalidateTimestamp";
    Order_OrderBy["IsSigned"] = "isSigned";
    Order_OrderBy["IsValid"] = "isValid";
    Order_OrderBy["Owner"] = "owner";
    Order_OrderBy["PresignTimestamp"] = "presignTimestamp";
    Order_OrderBy["Trades"] = "trades";
    Order_OrderBy["TradesTimestamp"] = "tradesTimestamp";
})(Order_OrderBy = exports.Order_OrderBy || (exports.Order_OrderBy = {}));
var PairDaily_OrderBy;
(function (PairDaily_OrderBy) {
    PairDaily_OrderBy["Id"] = "id";
    PairDaily_OrderBy["Timestamp"] = "timestamp";
    PairDaily_OrderBy["Token0"] = "token0";
    PairDaily_OrderBy["Token0Price"] = "token0Price";
    PairDaily_OrderBy["Token0relativePrice"] = "token0relativePrice";
    PairDaily_OrderBy["Token1"] = "token1";
    PairDaily_OrderBy["Token1Price"] = "token1Price";
    PairDaily_OrderBy["Token1relativePrice"] = "token1relativePrice";
    PairDaily_OrderBy["VolumeToken0"] = "volumeToken0";
    PairDaily_OrderBy["VolumeToken1"] = "volumeToken1";
    PairDaily_OrderBy["VolumeTradedEth"] = "volumeTradedEth";
    PairDaily_OrderBy["VolumeTradedUsd"] = "volumeTradedUsd";
})(PairDaily_OrderBy = exports.PairDaily_OrderBy || (exports.PairDaily_OrderBy = {}));
var PairHourly_OrderBy;
(function (PairHourly_OrderBy) {
    PairHourly_OrderBy["Id"] = "id";
    PairHourly_OrderBy["Timestamp"] = "timestamp";
    PairHourly_OrderBy["Token0"] = "token0";
    PairHourly_OrderBy["Token0Price"] = "token0Price";
    PairHourly_OrderBy["Token0relativePrice"] = "token0relativePrice";
    PairHourly_OrderBy["Token1"] = "token1";
    PairHourly_OrderBy["Token1Price"] = "token1Price";
    PairHourly_OrderBy["Token1relativePrice"] = "token1relativePrice";
    PairHourly_OrderBy["VolumeToken0"] = "volumeToken0";
    PairHourly_OrderBy["VolumeToken1"] = "volumeToken1";
    PairHourly_OrderBy["VolumeTradedEth"] = "volumeTradedEth";
    PairHourly_OrderBy["VolumeTradedUsd"] = "volumeTradedUsd";
})(PairHourly_OrderBy = exports.PairHourly_OrderBy || (exports.PairHourly_OrderBy = {}));
var Pair_OrderBy;
(function (Pair_OrderBy) {
    Pair_OrderBy["Id"] = "id";
    Pair_OrderBy["Token0"] = "token0";
    Pair_OrderBy["Token0Price"] = "token0Price";
    Pair_OrderBy["Token0relativePrice"] = "token0relativePrice";
    Pair_OrderBy["Token1"] = "token1";
    Pair_OrderBy["Token1Price"] = "token1Price";
    Pair_OrderBy["Token1relativePrice"] = "token1relativePrice";
    Pair_OrderBy["VolumeToken0"] = "volumeToken0";
    Pair_OrderBy["VolumeToken1"] = "volumeToken1";
    Pair_OrderBy["VolumeTradedEth"] = "volumeTradedEth";
    Pair_OrderBy["VolumeTradedUsd"] = "volumeTradedUsd";
})(Pair_OrderBy = exports.Pair_OrderBy || (exports.Pair_OrderBy = {}));
var Settlement_OrderBy;
(function (Settlement_OrderBy) {
    Settlement_OrderBy["FirstTradeTimestamp"] = "firstTradeTimestamp";
    Settlement_OrderBy["Id"] = "id";
    Settlement_OrderBy["Solver"] = "solver";
    Settlement_OrderBy["Trades"] = "trades";
    Settlement_OrderBy["TxHash"] = "txHash";
})(Settlement_OrderBy = exports.Settlement_OrderBy || (exports.Settlement_OrderBy = {}));
var TokenDailyTotal_OrderBy;
(function (TokenDailyTotal_OrderBy) {
    TokenDailyTotal_OrderBy["AveragePrice"] = "averagePrice";
    TokenDailyTotal_OrderBy["ClosePrice"] = "closePrice";
    TokenDailyTotal_OrderBy["HigherPrice"] = "higherPrice";
    TokenDailyTotal_OrderBy["Id"] = "id";
    TokenDailyTotal_OrderBy["LowerPrice"] = "lowerPrice";
    TokenDailyTotal_OrderBy["OpenPrice"] = "openPrice";
    TokenDailyTotal_OrderBy["Timestamp"] = "timestamp";
    TokenDailyTotal_OrderBy["Token"] = "token";
    TokenDailyTotal_OrderBy["TotalTrades"] = "totalTrades";
    TokenDailyTotal_OrderBy["TotalVolume"] = "totalVolume";
    TokenDailyTotal_OrderBy["TotalVolumeEth"] = "totalVolumeEth";
    TokenDailyTotal_OrderBy["TotalVolumeUsd"] = "totalVolumeUsd";
})(TokenDailyTotal_OrderBy = exports.TokenDailyTotal_OrderBy || (exports.TokenDailyTotal_OrderBy = {}));
var TokenHourlyTotal_OrderBy;
(function (TokenHourlyTotal_OrderBy) {
    TokenHourlyTotal_OrderBy["AveragePrice"] = "averagePrice";
    TokenHourlyTotal_OrderBy["ClosePrice"] = "closePrice";
    TokenHourlyTotal_OrderBy["HigherPrice"] = "higherPrice";
    TokenHourlyTotal_OrderBy["Id"] = "id";
    TokenHourlyTotal_OrderBy["LowerPrice"] = "lowerPrice";
    TokenHourlyTotal_OrderBy["OpenPrice"] = "openPrice";
    TokenHourlyTotal_OrderBy["Timestamp"] = "timestamp";
    TokenHourlyTotal_OrderBy["Token"] = "token";
    TokenHourlyTotal_OrderBy["TotalTrades"] = "totalTrades";
    TokenHourlyTotal_OrderBy["TotalVolume"] = "totalVolume";
    TokenHourlyTotal_OrderBy["TotalVolumeEth"] = "totalVolumeEth";
    TokenHourlyTotal_OrderBy["TotalVolumeUsd"] = "totalVolumeUsd";
})(TokenHourlyTotal_OrderBy = exports.TokenHourlyTotal_OrderBy || (exports.TokenHourlyTotal_OrderBy = {}));
var TokenTradingEvent_OrderBy;
(function (TokenTradingEvent_OrderBy) {
    TokenTradingEvent_OrderBy["AmountEth"] = "amountEth";
    TokenTradingEvent_OrderBy["AmountUsd"] = "amountUsd";
    TokenTradingEvent_OrderBy["Id"] = "id";
    TokenTradingEvent_OrderBy["Timestamp"] = "timestamp";
    TokenTradingEvent_OrderBy["Token"] = "token";
    TokenTradingEvent_OrderBy["Trade"] = "trade";
})(TokenTradingEvent_OrderBy = exports.TokenTradingEvent_OrderBy || (exports.TokenTradingEvent_OrderBy = {}));
var Token_OrderBy;
(function (Token_OrderBy) {
    Token_OrderBy["Address"] = "address";
    Token_OrderBy["DailyTotals"] = "dailyTotals";
    Token_OrderBy["Decimals"] = "decimals";
    Token_OrderBy["FirstTradeTimestamp"] = "firstTradeTimestamp";
    Token_OrderBy["History"] = "history";
    Token_OrderBy["HourlyTotals"] = "hourlyTotals";
    Token_OrderBy["Id"] = "id";
    Token_OrderBy["Name"] = "name";
    Token_OrderBy["NumberOfTrades"] = "numberOfTrades";
    Token_OrderBy["PriceEth"] = "priceEth";
    Token_OrderBy["PriceUsd"] = "priceUsd";
    Token_OrderBy["Symbol"] = "symbol";
    Token_OrderBy["TotalVolume"] = "totalVolume";
    Token_OrderBy["TotalVolumeEth"] = "totalVolumeEth";
    Token_OrderBy["TotalVolumeUsd"] = "totalVolumeUsd";
})(Token_OrderBy = exports.Token_OrderBy || (exports.Token_OrderBy = {}));
var Total_OrderBy;
(function (Total_OrderBy) {
    Total_OrderBy["FeesEth"] = "feesEth";
    Total_OrderBy["FeesUsd"] = "feesUsd";
    Total_OrderBy["Id"] = "id";
    Total_OrderBy["NumberOfTrades"] = "numberOfTrades";
    Total_OrderBy["Orders"] = "orders";
    Total_OrderBy["Settlements"] = "settlements";
    Total_OrderBy["Tokens"] = "tokens";
    Total_OrderBy["Traders"] = "traders";
    Total_OrderBy["VolumeEth"] = "volumeEth";
    Total_OrderBy["VolumeUsd"] = "volumeUsd";
})(Total_OrderBy = exports.Total_OrderBy || (exports.Total_OrderBy = {}));
var Trade_OrderBy;
(function (Trade_OrderBy) {
    Trade_OrderBy["BuyAmount"] = "buyAmount";
    Trade_OrderBy["BuyAmountEth"] = "buyAmountEth";
    Trade_OrderBy["BuyAmountUsd"] = "buyAmountUsd";
    Trade_OrderBy["BuyToken"] = "buyToken";
    Trade_OrderBy["FeeAmount"] = "feeAmount";
    Trade_OrderBy["GasPrice"] = "gasPrice";
    Trade_OrderBy["Id"] = "id";
    Trade_OrderBy["Order"] = "order";
    Trade_OrderBy["SellAmount"] = "sellAmount";
    Trade_OrderBy["SellAmountEth"] = "sellAmountEth";
    Trade_OrderBy["SellAmountUsd"] = "sellAmountUsd";
    Trade_OrderBy["SellToken"] = "sellToken";
    Trade_OrderBy["Settlement"] = "settlement";
    Trade_OrderBy["Timestamp"] = "timestamp";
    Trade_OrderBy["TxHash"] = "txHash";
})(Trade_OrderBy = exports.Trade_OrderBy || (exports.Trade_OrderBy = {}));
var UniswapPool_OrderBy;
(function (UniswapPool_OrderBy) {
    UniswapPool_OrderBy["Id"] = "id";
    UniswapPool_OrderBy["Liquidity"] = "liquidity";
    UniswapPool_OrderBy["Tick"] = "tick";
    UniswapPool_OrderBy["Token0"] = "token0";
    UniswapPool_OrderBy["Token0Price"] = "token0Price";
    UniswapPool_OrderBy["Token1"] = "token1";
    UniswapPool_OrderBy["Token1Price"] = "token1Price";
    UniswapPool_OrderBy["TotalValueLockedToken0"] = "totalValueLockedToken0";
    UniswapPool_OrderBy["TotalValueLockedToken1"] = "totalValueLockedToken1";
})(UniswapPool_OrderBy = exports.UniswapPool_OrderBy || (exports.UniswapPool_OrderBy = {}));
var UniswapToken_OrderBy;
(function (UniswapToken_OrderBy) {
    UniswapToken_OrderBy["Address"] = "address";
    UniswapToken_OrderBy["AllowedPools"] = "allowedPools";
    UniswapToken_OrderBy["Decimals"] = "decimals";
    UniswapToken_OrderBy["Id"] = "id";
    UniswapToken_OrderBy["Name"] = "name";
    UniswapToken_OrderBy["PriceEth"] = "priceEth";
    UniswapToken_OrderBy["PriceUsd"] = "priceUsd";
    UniswapToken_OrderBy["Symbol"] = "symbol";
})(UniswapToken_OrderBy = exports.UniswapToken_OrderBy || (exports.UniswapToken_OrderBy = {}));
var User_OrderBy;
(function (User_OrderBy) {
    User_OrderBy["Address"] = "address";
    User_OrderBy["FirstTradeTimestamp"] = "firstTradeTimestamp";
    User_OrderBy["Id"] = "id";
    User_OrderBy["IsSolver"] = "isSolver";
    User_OrderBy["NumberOfTrades"] = "numberOfTrades";
    User_OrderBy["OrdersPlaced"] = "ordersPlaced";
    User_OrderBy["SolvedAmountEth"] = "solvedAmountEth";
    User_OrderBy["SolvedAmountUsd"] = "solvedAmountUsd";
    User_OrderBy["TradedAmountEth"] = "tradedAmountEth";
    User_OrderBy["TradedAmountUsd"] = "tradedAmountUsd";
})(User_OrderBy = exports.User_OrderBy || (exports.User_OrderBy = {}));
var _SubgraphErrorPolicy_;
(function (_SubgraphErrorPolicy_) {
    /** Data will be returned even if the subgraph has indexing errors */
    _SubgraphErrorPolicy_["Allow"] = "allow";
    /** If the subgraph has indexing errors, data will be omitted. The default. */
    _SubgraphErrorPolicy_["Deny"] = "deny";
})(_SubgraphErrorPolicy_ = exports._SubgraphErrorPolicy_ || (exports._SubgraphErrorPolicy_ = {}));
//# sourceMappingURL=graphql.js.map