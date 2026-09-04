import {
  AbstractProviderAdapter,
  BigIntish,
  resolveSigner,
  setGlobalAdapter,
  SignerLike,
  TransactionResponse,
} from '@cowprotocol/sdk-common'

import { ComposableCowPoller } from './ComposableCowPoller'
import type {
  ComposableCowPollerDirectRevoke,
  ComposableCowPollerRegisterTypedDataParams,
  ComposableCowPollerRevokeTypedDataParams,
  ComposableCowPollerSchedule,
  ComposableCowPollerScheduleAuthorization,
} from './types'

/** Configuration for a signer-aware {@link ComposableCowPollerSdk} instance. */
export type ComposableCowPollerSdkConfig = {
  readonly chainId: number
  readonly pollerAddress: string
  readonly signer?: SignerLike
}

/** Signed Poller authorization together with its ready-to-submit calldata. */
export type ComposableCowPollerSignedCall<TData> = {
  readonly typedData: TData
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
   * Signs a registration for the schedule's supplied authorization epoch.
   *
   * @param params - Schedule, signature deadline, and optional signer override.
   * @returns The exact typed data, its signature, and `registerWithSignature` calldata.
   * @remarks Revoking the schedule increments its epoch and invalidates signatures from prior epochs.
   */
  async signRegister({
    schedule,
    deadline,
    signer,
  }: Omit<ComposableCowPollerRegisterTypedDataParams, 'chainId'> & {
    readonly signer?: SignerLike
  }): Promise<ComposableCowPollerSignedCall<ReturnType<ComposableCowPoller['getRegisterTypedData']>>> {
    const scheduleSnapshot = { ...schedule }
    const typedData = this.poller.getRegisterTypedData({ chainId: this.chainId, schedule: scheduleSnapshot, deadline })
    const signature = await resolveSigner(signer ?? this.signer).signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
    )

    return {
      typedData,
      signature,
      calldata: this.poller.encodeRegisterWithSignature(scheduleSnapshot, deadline, signature),
    }
  }

  /**
   * Signs a revocation for the supplied schedule identity and authorization epoch.
   *
   * @param params - Schedule identity, authorization epoch, signature deadline, and optional signer override.
   * @returns The exact typed data, its signature, and `revokeWithSignature` calldata.
   * @remarks Successful revocation increments the epoch and invalidates this authorization.
   */
  async signRevoke({
    handler,
    authEpoch,
    funder,
    owner,
    salt,
    deadline,
    signer,
  }: Omit<ComposableCowPollerRevokeTypedDataParams, 'chainId'> & {
    readonly signer?: SignerLike
  }): Promise<ComposableCowPollerSignedCall<ReturnType<ComposableCowPoller['getRevokeTypedData']>>> {
    const authorization = { handler, authEpoch, funder, owner, salt }
    const typedData = this.poller.getRevokeTypedData({ chainId: this.chainId, ...authorization, deadline })
    const signature = await resolveSigner(signer ?? this.signer).signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
    )

    return {
      typedData,
      signature,
      calldata: this.poller.encodeRevokeWithSignature(authorization, deadline, signature),
    }
  }

  /**
   * Submits a direct registration transaction. The transaction signer must be `schedule.funder`.
   *
   * @param params - Poller schedule and optional signer override.
   * @returns The submitted transaction response.
   */
  register({
    schedule,
    signer,
  }: {
    readonly schedule: ComposableCowPollerSchedule
    readonly signer?: SignerLike
  }): Promise<TransactionResponse> {
    return this.send(this.poller.encodeRegister(schedule), signer)
  }

  /**
   * Submits a registration authorized by the funder's signature.
   *
   * @param params - Schedule, deadline, signature, and optional transaction-submitter signer.
   * @returns The submitted transaction response.
   */
  registerWithSignature({
    schedule,
    deadline,
    signature,
    signer,
  }: {
    readonly schedule: ComposableCowPollerSchedule
    readonly deadline: BigIntish
    readonly signature: string
    readonly signer?: SignerLike
  }): Promise<TransactionResponse> {
    return this.send(this.poller.encodeRegisterWithSignature(schedule, deadline, signature), signer)
  }

  /**
   * Polls funds for a registered schedule.
   *
   * @param params - Schedule ID and optional signer override.
   * @returns The submitted transaction response.
   */
  pollFunds({ id, signer }: { readonly id: string; readonly signer?: SignerLike }): Promise<TransactionResponse> {
    return this.send(this.poller.encodePollFunds(id), signer)
  }

  /**
   * Submits a direct revocation transaction. The transaction signer must be the schedule's funder.
   *
   * @param params - Direct-revoke fields and optional signer override.
   * @returns The submitted transaction response.
   */
  revoke({
    handler,
    owner,
    salt,
    signer,
  }: ComposableCowPollerDirectRevoke & { readonly signer?: SignerLike }): Promise<TransactionResponse> {
    return this.send(this.poller.encodeRevoke({ handler, owner, salt }), signer)
  }

  /**
   * Submits a revocation authorized by the funder's signature.
   *
   * @param params - Schedule authorization, deadline, signature, and optional transaction-submitter signer.
   * @returns The submitted transaction response.
   */
  revokeWithSignature({
    handler,
    authEpoch,
    funder,
    owner,
    salt,
    deadline,
    signature,
    signer,
  }: ComposableCowPollerScheduleAuthorization & {
    readonly deadline: BigIntish
    readonly signature: string
    readonly signer?: SignerLike
  }): Promise<TransactionResponse> {
    return this.send(
      this.poller.encodeRevokeWithSignature({ handler, authEpoch, funder, owner, salt }, deadline, signature),
      signer,
    )
  }

  private send(calldata: string, signer?: SignerLike): Promise<TransactionResponse> {
    return resolveSigner(signer ?? this.signer).sendTransaction({ to: this.pollerAddress, data: calldata })
  }
}
