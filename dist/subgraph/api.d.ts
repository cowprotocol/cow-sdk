import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql';
import { DocumentNode } from 'graphql/index';
import { Variables } from 'graphql-request';
import { SupportedChainId } from '../common/chains';
export declare class SubgraphApi {
    private chainId;
    API_NAME: string;
    private envConfig;
    constructor(chainId: SupportedChainId, env?: 'prod' | 'staging');
    getTotals(): Promise<TotalsQuery['totals'][0]>;
    getLastDaysVolume(days: number): Promise<LastDaysVolumeQuery>;
    getLastHoursVolume(hours: number): Promise<LastHoursVolumeQuery>;
    runQuery<T>(query: string | DocumentNode, variables?: Variables): Promise<T>;
}
