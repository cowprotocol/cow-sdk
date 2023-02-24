"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubgraphApi = void 0;
const tslib_1 = require("tslib");
const cow_error_1 = require("../common/cow-error");
const queries_1 = require("./queries");
const graphql_request_1 = require("graphql-request");
const configs_1 = require("../common/configs");
class SubgraphApi {
    constructor(env = 'prod') {
        this.API_NAME = 'CoW Protocol Subgraph';
        this.envConfig = env === 'prod' ? configs_1.PROD_CONFIG : configs_1.STAGING_CONFIG;
    }
    getTotals(chainId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.debug(`[subgraph:${this.API_NAME}] Get totals for:`, chainId);
            const response = yield this.runQuery(chainId, queries_1.TOTALS_QUERY);
            return response.totals[0];
        });
    }
    getLastDaysVolume(chainId, days) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.debug(`[subgraph:${this.API_NAME}] Get last ${days} days volume for:`, chainId);
            return this.runQuery(chainId, queries_1.LAST_DAYS_VOLUME_QUERY, { days });
        });
    }
    getLastHoursVolume(chainId, hours) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.debug(`[subgraph:${this.API_NAME}] Get last ${hours} hours volume for:`, chainId);
            return this.runQuery(chainId, queries_1.LAST_HOURS_VOLUME_QUERY, { hours });
        });
    }
    runQuery(chainId, query, variables) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const baseUrl = this.envConfig[chainId].subgraphUrl;
            try {
                return yield (0, graphql_request_1.request)(baseUrl, query, variables);
            }
            catch (error) {
                console.error(`[subgraph:${this.API_NAME}]`, error);
                throw new cow_error_1.CowError(`Error running query: ${query}. Variables: ${JSON.stringify(variables)}. API: ${baseUrl}. Inner Error: ${error}`);
            }
        });
    }
}
exports.SubgraphApi = SubgraphApi;
//# sourceMappingURL=api.js.map