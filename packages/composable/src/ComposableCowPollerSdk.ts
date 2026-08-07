import {
  AbstractProviderAdapter,
  BigIntish,
  getGlobalAdapter,
  setGlobalAdapter,
  SignerLike,
} from '@cowprotocol/sdk-common'

import { ComposableCowPoller } from './ComposableCowPoller'
import type {
  ComposableCowPollerRegisterTypedDataParams,
  ComposableCowPollerRevokeTypedDataParams,
  ComposableCowPollerSchedule,
} from './types'

/** Configuration shared by all {@link ComposableCowPollerSdk} calls. */
export type ComposableCowPollerSdkConfig = {
  readonly chainId: number
  readonly pollerAddress: string
  readonly signer?: SignerLike
}

export type ComposableCowPollerRegisterParams = {
  readonly schedule: ComposableCowPollerSchedule
  readonly signer?: SignerLike
}

export type ComposableCowPollerScheduleActionParams = {
  readonly id: string
  readonly signer?: SignerLike
}

export type ComposableCowPollerSignRegisterParams = Omit<
  ComposableCowPollerRegisterTypedDataParams,
  'chainId' | 'nonce'
> & {
  readonly signer?: SignerLike
}

export type ComposableCowPollerSignRevokeParams = Omit<
  ComposableCowPollerRevokeTypedDataParams,
  'chainId' | 'nonce'
> & {
  readonly signer?: SignerLike
}

export type ComposableCowPollerRegisterWithSignatureParams = {
  readonly schedule: ComposableCowPollerSchedule
  readonly deadline: BigIntish
  readonly signature: string
  readonly signer?: SignerLike
}

export type ComposableCowPollerRevokeWithSignatureParams = {
  readonly id: string
  readonly deadline: BigIntish
  readonly signature: string
  readonly signer?: SignerLike
}

/** Signed Poller authorization together with its ready-to-submit calldata. */
export type ComposableCowPollerSignedCall<TTypedData> = {
  readonly typedData: TTypedData
  readonly signature: string
  readonly calldata: string
}

/**
 * Signer-aware facade for a {@link ComposableCowPoller} deployment.
 *
 * The facade follows the same layering as `TradingSdk`: low-level reads and calldata encoding
 * remain available through {@link poller}, while this class resolves signers, signs authorizations,
 * and submits transactions through the configured adapter.
 */
export class ComposableCowPollerSdk {
  readonly chainId: number
  readonly pollerAddress: string
  readonly poller: ComposableCowPoller
  private readonly signer?: SignerLike

  /**
   * Creates a signer-aware Poller facade.
   *
   * @param config - Poller deployment and optional default signer.
   * @param adapter - Adapter to install globally, matching the `TradingSdk` constructor convention.
   */
  constructor(config: ComposableCowPollerSdkConfig, adapter?: AbstractProviderAdapter) {
    if (adapter) setGlobalAdapter(adapter)
    this.chainId = config.chainId
    this.pollerAddress = config.pollerAddress
    this.signer = config.signer
    this.poller = new ComposableCowPoller(config.pollerAddress)
  }

  /**
   * Signs a registration using the funder's current on-chain nonce.
   *
   * @param params - Schedule, signature deadline, and optional signer override.
   * @returns The exact typed data, its signature, and `registerWithSignature` calldata.
   * @remarks The signature is single-use because registration and revocation share the funder's nonce.
   */
  async signRegister({
    schedule,
    deadline,
    signer,
  }: ComposableCowPollerSignRegisterParams): Promise<
    ComposableCowPollerSignedCall<ReturnType<ComposableCowPoller['getRegisterTypedData']>>
  > {
    const nonce = await this.poller.getNonce(schedule.funder)
    const typedData = this.poller.getRegisterTypedData({ chainId: this.chainId, schedule, nonce, deadline })
    const signature = await this.resolveSigner(signer).signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
    )

    return {
      typedData,
      signature,
      calldata: this.poller.encodeRegisterWithSignature(schedule, deadline, signature),
    }
  }

  /**
   * Signs a revocation using the funder's current on-chain nonce.
   *
   * @param params - Schedule ID, funder, signature deadline, and optional signer override.
   * @returns The exact typed data, its signature, and `revokeWithSignature` calldata.
   * @remarks The signature is single-use because registration and revocation share the funder's nonce.
   */
  async signRevoke({
    id,
    funder,
    deadline,
    signer,
  }: ComposableCowPollerSignRevokeParams): Promise<
    ComposableCowPollerSignedCall<ReturnType<ComposableCowPoller['getRevokeTypedData']>>
  > {
    const nonce = await this.poller.getNonce(funder)
    const typedData = this.poller.getRevokeTypedData({ chainId: this.chainId, id, funder, nonce, deadline })
    const signature = await this.resolveSigner(signer).signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
    )

    return {
      typedData,
      signature,
      calldata: this.poller.encodeRevokeWithSignature(id, deadline, signature),
    }
  }

  /**
   * Submits a direct registration transaction. The transaction signer must be `schedule.funder`.
   *
   * @param params - Poller schedule and optional signer override.
   * @returns The submitted transaction hash.
   */
  register({ schedule, signer }: ComposableCowPollerRegisterParams): Promise<string> {
    return this.send(this.poller.encodeRegister(schedule), signer)
  }

  /**
   * Submits a registration authorized by the funder's signature.
   *
   * @param params - Schedule, deadline, signature, and optional transaction-submitter signer.
   * @returns The submitted transaction hash.
   */
  registerWithSignature({
    schedule,
    deadline,
    signature,
    signer,
  }: ComposableCowPollerRegisterWithSignatureParams): Promise<string> {
    return this.send(this.poller.encodeRegisterWithSignature(schedule, deadline, signature), signer)
  }

  /**
   * Polls funds for a registered schedule.
   *
   * @param params - Schedule ID and optional signer override.
   * @returns The submitted transaction hash.
   */
  pollFunds({ id, signer }: ComposableCowPollerScheduleActionParams): Promise<string> {
    return this.send(this.poller.encodePollFunds(id), signer)
  }

  /**
   * Submits a direct revocation transaction. The transaction signer must be the schedule's funder.
   *
   * @param params - Schedule ID and optional signer override.
   * @returns The submitted transaction hash.
   */
  revoke({ id, signer }: ComposableCowPollerScheduleActionParams): Promise<string> {
    return this.send(this.poller.encodeRevoke(id), signer)
  }

  /**
   * Submits a revocation authorized by the funder's signature.
   *
   * @param params - Schedule ID, deadline, signature, and optional transaction-submitter signer.
   * @returns The submitted transaction hash.
   */
  revokeWithSignature({
    id,
    deadline,
    signature,
    signer,
  }: ComposableCowPollerRevokeWithSignatureParams): Promise<string> {
    return this.send(this.poller.encodeRevokeWithSignature(id, deadline, signature), signer)
  }

  private resolveSigner(signer?: SignerLike) {
    const adapter = getGlobalAdapter()
    const signerLike = signer ?? this.signer

    return signerLike ? adapter.createSigner(signerLike) : adapter.signer
  }

  private async send(calldata: string, signer?: SignerLike): Promise<string> {
    const transaction = await this.resolveSigner(signer).sendTransaction({ to: this.pollerAddress, data: calldata })

    return transaction.hash
  }
}
