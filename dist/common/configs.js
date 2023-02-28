"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAGING_CONFIG = exports.PROD_CONFIG = void 0;
const chains_1 = require("./chains");
exports.PROD_CONFIG = {
    [chains_1.SupportedChainId.MAINNET]: {
        apiUrl: 'https://api.cow.fi/mainnet',
        subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow',
    },
    [chains_1.SupportedChainId.GNOSIS_CHAIN]: {
        apiUrl: 'https://api.cow.fi/xdai',
        subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc',
    },
    [chains_1.SupportedChainId.GOERLI]: {
        apiUrl: 'https://api.cow.fi/goerli',
        subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-goerli',
    },
};
exports.STAGING_CONFIG = {
    [chains_1.SupportedChainId.MAINNET]: {
        apiUrl: 'https://barn.api.cow.fi/mainnet',
        subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-staging',
    },
    [chains_1.SupportedChainId.GNOSIS_CHAIN]: {
        apiUrl: 'https://barn.api.cow.fi/xdai',
        subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc-staging',
    },
    [chains_1.SupportedChainId.GOERLI]: {
        apiUrl: 'https://barn.api.cow.fi/goerli',
        subgraphUrl: '',
    },
};
//# sourceMappingURL=configs.js.map