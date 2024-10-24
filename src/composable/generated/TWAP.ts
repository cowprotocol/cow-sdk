/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export declare namespace IConditionalOrder {
  export type ConditionalOrderParamsStruct = {
    handler: string;
    salt: BytesLike;
    staticInput: BytesLike;
  };

  export type ConditionalOrderParamsStructOutput = [string, string, string] & {
    handler: string;
    salt: string;
    staticInput: string;
  };
}

export declare namespace GPv2Order {
  export type DataStruct = {
    sellToken: string;
    buyToken: string;
    receiver: string;
    sellAmount: BigNumberish;
    buyAmount: BigNumberish;
    validTo: BigNumberish;
    appData: BytesLike;
    feeAmount: BigNumberish;
    kind: BytesLike;
    partiallyFillable: boolean;
    sellTokenBalance: BytesLike;
    buyTokenBalance: BytesLike;
  };

  export type DataStructOutput = [
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    number,
    string,
    BigNumber,
    string,
    boolean,
    string,
    string
  ] & {
    sellToken: string;
    buyToken: string;
    receiver: string;
    sellAmount: BigNumber;
    buyAmount: BigNumber;
    validTo: number;
    appData: string;
    feeAmount: BigNumber;
    kind: string;
    partiallyFillable: boolean;
    sellTokenBalance: string;
    buyTokenBalance: string;
  };
}

export interface TWAPInterface extends utils.Interface {
  functions: {
    "getTradeableOrder(address,address,bytes32,bytes,bytes)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "verify(address,address,bytes32,bytes32,bytes32,bytes,bytes,(address,address,address,uint256,uint256,uint32,bytes32,uint256,bytes32,bool,bytes32,bytes32))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "getTradeableOrder" | "supportsInterface" | "verify"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getTradeableOrder",
    values: [string, string, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "verify",
    values: [
      string,
      string,
      BytesLike,
      BytesLike,
      BytesLike,
      BytesLike,
      BytesLike,
      GPv2Order.DataStruct
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "getTradeableOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "verify", data: BytesLike): Result;

  events: {
    "ConditionalOrderCreated(address,(address,bytes32,bytes))": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ConditionalOrderCreated"): EventFragment;
}

export interface ConditionalOrderCreatedEventObject {
  owner: string;
  params: IConditionalOrder.ConditionalOrderParamsStructOutput;
}
export type ConditionalOrderCreatedEvent = TypedEvent<
  [string, IConditionalOrder.ConditionalOrderParamsStructOutput],
  ConditionalOrderCreatedEventObject
>;

export type ConditionalOrderCreatedEventFilter =
  TypedEventFilter<ConditionalOrderCreatedEvent>;

export interface TWAP extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: TWAPInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    getTradeableOrder(
      owner: string,
      arg1: string,
      ctx: BytesLike,
      staticInput: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [GPv2Order.DataStructOutput] & { order: GPv2Order.DataStructOutput }
    >;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    verify(
      owner: string,
      sender: string,
      _hash: BytesLike,
      domainSeparator: BytesLike,
      ctx: BytesLike,
      staticInput: BytesLike,
      offchainInput: BytesLike,
      arg7: GPv2Order.DataStruct,
      overrides?: CallOverrides
    ): Promise<[void]>;
  };

  getTradeableOrder(
    owner: string,
    arg1: string,
    ctx: BytesLike,
    staticInput: BytesLike,
    arg4: BytesLike,
    overrides?: CallOverrides
  ): Promise<GPv2Order.DataStructOutput>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  verify(
    owner: string,
    sender: string,
    _hash: BytesLike,
    domainSeparator: BytesLike,
    ctx: BytesLike,
    staticInput: BytesLike,
    offchainInput: BytesLike,
    arg7: GPv2Order.DataStruct,
    overrides?: CallOverrides
  ): Promise<void>;

  callStatic: {
    getTradeableOrder(
      owner: string,
      arg1: string,
      ctx: BytesLike,
      staticInput: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<GPv2Order.DataStructOutput>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    verify(
      owner: string,
      sender: string,
      _hash: BytesLike,
      domainSeparator: BytesLike,
      ctx: BytesLike,
      staticInput: BytesLike,
      offchainInput: BytesLike,
      arg7: GPv2Order.DataStruct,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "ConditionalOrderCreated(address,(address,bytes32,bytes))"(
      owner?: string | null,
      params?: null
    ): ConditionalOrderCreatedEventFilter;
    ConditionalOrderCreated(
      owner?: string | null,
      params?: null
    ): ConditionalOrderCreatedEventFilter;
  };

  estimateGas: {
    getTradeableOrder(
      owner: string,
      arg1: string,
      ctx: BytesLike,
      staticInput: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    verify(
      owner: string,
      sender: string,
      _hash: BytesLike,
      domainSeparator: BytesLike,
      ctx: BytesLike,
      staticInput: BytesLike,
      offchainInput: BytesLike,
      arg7: GPv2Order.DataStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getTradeableOrder(
      owner: string,
      arg1: string,
      ctx: BytesLike,
      staticInput: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    verify(
      owner: string,
      sender: string,
      _hash: BytesLike,
      domainSeparator: BytesLike,
      ctx: BytesLike,
      staticInput: BytesLike,
      offchainInput: BytesLike,
      arg7: GPv2Order.DataStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
