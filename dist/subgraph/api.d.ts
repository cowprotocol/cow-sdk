import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql';
import { DocumentNode } from 'graphql/index';
import { Variables } from 'graphql-request';
import { SupportedChainId } from '../common/chains';
export declare class SubgraphApi {
    API_NAME: string;
    private envConfig;
    constructor(env?: 'prod' | 'staging');
    getTotals(chainId: SupportedChainId): Promise<TotalsQuery['totals'][0]>;
    getLastDaysVolume(chainId: SupportedChainId, days: number): Promise<LastDaysVolumeQuery>;
    getLastHoursVolume(chainId: SupportedChainId, hours: number): Promise<LastHoursVolumeQuery>;
    runQuery<T>(chainId: SupportedChainId, query: string | DocumentNode, variables?: Variables): Promise<T>;
}
