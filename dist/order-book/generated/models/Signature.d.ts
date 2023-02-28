import type { EcdsaSignature } from './EcdsaSignature';
import type { PreSignature } from './PreSignature';
/**
 * A signature.
 */
export type Signature = (EcdsaSignature | PreSignature);
