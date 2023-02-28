"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultService = exports.SigningScheme = exports.SellTokenSource = exports.ReplaceOrderError = exports.PriceQuality = exports.OrderStatus = exports.OrderQuoteSide = exports.OrderPostError = exports.OrderKind = exports.OrderClass = exports.OrderCancellationError = exports.OnchainOrderData = exports.FeeAndQuoteError = exports.EcdsaSigningScheme = exports.BuyTokenDestination = exports.OpenAPI = exports.CancelError = exports.CancelablePromise = exports.BaseHttpRequest = exports.ApiError = exports.OrderBookClient = void 0;
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
var OrderBookClient_1 = require("./OrderBookClient");
Object.defineProperty(exports, "OrderBookClient", { enumerable: true, get: function () { return OrderBookClient_1.OrderBookClient; } });
var ApiError_1 = require("./core/ApiError");
Object.defineProperty(exports, "ApiError", { enumerable: true, get: function () { return ApiError_1.ApiError; } });
var BaseHttpRequest_1 = require("./core/BaseHttpRequest");
Object.defineProperty(exports, "BaseHttpRequest", { enumerable: true, get: function () { return BaseHttpRequest_1.BaseHttpRequest; } });
var CancelablePromise_1 = require("./core/CancelablePromise");
Object.defineProperty(exports, "CancelablePromise", { enumerable: true, get: function () { return CancelablePromise_1.CancelablePromise; } });
Object.defineProperty(exports, "CancelError", { enumerable: true, get: function () { return CancelablePromise_1.CancelError; } });
var OpenAPI_1 = require("./core/OpenAPI");
Object.defineProperty(exports, "OpenAPI", { enumerable: true, get: function () { return OpenAPI_1.OpenAPI; } });
var BuyTokenDestination_1 = require("./models/BuyTokenDestination");
Object.defineProperty(exports, "BuyTokenDestination", { enumerable: true, get: function () { return BuyTokenDestination_1.BuyTokenDestination; } });
var EcdsaSigningScheme_1 = require("./models/EcdsaSigningScheme");
Object.defineProperty(exports, "EcdsaSigningScheme", { enumerable: true, get: function () { return EcdsaSigningScheme_1.EcdsaSigningScheme; } });
var FeeAndQuoteError_1 = require("./models/FeeAndQuoteError");
Object.defineProperty(exports, "FeeAndQuoteError", { enumerable: true, get: function () { return FeeAndQuoteError_1.FeeAndQuoteError; } });
var OnchainOrderData_1 = require("./models/OnchainOrderData");
Object.defineProperty(exports, "OnchainOrderData", { enumerable: true, get: function () { return OnchainOrderData_1.OnchainOrderData; } });
var OrderCancellationError_1 = require("./models/OrderCancellationError");
Object.defineProperty(exports, "OrderCancellationError", { enumerable: true, get: function () { return OrderCancellationError_1.OrderCancellationError; } });
var OrderClass_1 = require("./models/OrderClass");
Object.defineProperty(exports, "OrderClass", { enumerable: true, get: function () { return OrderClass_1.OrderClass; } });
var OrderKind_1 = require("./models/OrderKind");
Object.defineProperty(exports, "OrderKind", { enumerable: true, get: function () { return OrderKind_1.OrderKind; } });
var OrderPostError_1 = require("./models/OrderPostError");
Object.defineProperty(exports, "OrderPostError", { enumerable: true, get: function () { return OrderPostError_1.OrderPostError; } });
var OrderQuoteSide_1 = require("./models/OrderQuoteSide");
Object.defineProperty(exports, "OrderQuoteSide", { enumerable: true, get: function () { return OrderQuoteSide_1.OrderQuoteSide; } });
var OrderStatus_1 = require("./models/OrderStatus");
Object.defineProperty(exports, "OrderStatus", { enumerable: true, get: function () { return OrderStatus_1.OrderStatus; } });
var PriceQuality_1 = require("./models/PriceQuality");
Object.defineProperty(exports, "PriceQuality", { enumerable: true, get: function () { return PriceQuality_1.PriceQuality; } });
var ReplaceOrderError_1 = require("./models/ReplaceOrderError");
Object.defineProperty(exports, "ReplaceOrderError", { enumerable: true, get: function () { return ReplaceOrderError_1.ReplaceOrderError; } });
var SellTokenSource_1 = require("./models/SellTokenSource");
Object.defineProperty(exports, "SellTokenSource", { enumerable: true, get: function () { return SellTokenSource_1.SellTokenSource; } });
var SigningScheme_1 = require("./models/SigningScheme");
Object.defineProperty(exports, "SigningScheme", { enumerable: true, get: function () { return SigningScheme_1.SigningScheme; } });
var DefaultService_1 = require("./services/DefaultService");
Object.defineProperty(exports, "DefaultService", { enumerable: true, get: function () { return DefaultService_1.DefaultService; } });
//# sourceMappingURL=index.js.map