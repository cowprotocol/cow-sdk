"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAST_HOURS_VOLUME_QUERY = exports.LAST_DAYS_VOLUME_QUERY = exports.TOTALS_QUERY = void 0;
const graphql_request_1 = require("graphql-request");
exports.TOTALS_QUERY = (0, graphql_request_1.gql) `
  query Totals {
    totals {
      tokens
      orders
      traders
      settlements
      volumeUsd
      volumeEth
      feesUsd
      feesEth
    }
  }
`;
exports.LAST_DAYS_VOLUME_QUERY = (0, graphql_request_1.gql) `
  query LastDaysVolume($days: Int!) {
    dailyTotals(orderBy: timestamp, orderDirection: desc, first: $days) {
      timestamp
      volumeUsd
    }
  }
`;
exports.LAST_HOURS_VOLUME_QUERY = (0, graphql_request_1.gql) `
  query LastHoursVolume($hours: Int!) {
    hourlyTotals(orderBy: timestamp, orderDirection: desc, first: $hours) {
      timestamp
      volumeUsd
    }
  }
`;
//# sourceMappingURL=queries.js.map