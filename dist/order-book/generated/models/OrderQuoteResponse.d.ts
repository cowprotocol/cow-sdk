import type { Address } from './Address';
import type { OrderParameters } from './OrderParameters';
/**
 * An order quoted by the back end that can be directly signed and
 * submitted to the order creation backend.
 *
 */
export type OrderQuoteResponse = {
    quote: OrderParameters;
    from?: Address;
    /**
     * Expiration date of the offered fee. Order service might not accept
     * the fee after this expiration date. Encoded as ISO 8601 UTC.
     *
     */
    expiration: string;
    /**
     * Order ID linked to a quote to enable providing more metadata when analyzing
     * order slippage.
     *
     */
    id?: number;
};
