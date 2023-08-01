/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * An `appData` document that is registered with the API.
 */
export type AppDataDocument = {
    /**
     * The string encoding of a JSON object representing some `appData`. The
     * format of the JSON expected in the `appData` field is defined
     * [here](https://github.com/cowprotocol/app-data).
     *
     */
    fullAppData?: string;
};

