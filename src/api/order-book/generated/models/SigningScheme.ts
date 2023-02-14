/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * How was the order signed?
 */
export enum SigningScheme {
    EIP712 = 'eip712',
    ETHSIGN = 'ethsign',
    PRESIGN = 'presign',
    EIP1271 = 'eip1271',
}
