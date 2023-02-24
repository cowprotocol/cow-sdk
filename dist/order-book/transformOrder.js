"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformOrder = void 0;
const contracts_1 = require("@cowprotocol/contracts");
function transformOrder(order) {
    return transformEthFlowOrder(addTotalFeeToOrder(order));
}
exports.transformOrder = transformOrder;
/**
 * The executedSurplusFee represents exactly the fee that was charged (regardless of the fee signed with the order).
 * So, while the protocol currently does not allow placing a limit order with any other fee than 0 - the backend is designed to support these kinds of orders for the future.
 */
function addTotalFeeToOrder(dto) {
    const { executedFeeAmount, executedSurplusFee } = dto;
    const totalFee = executedSurplusFee !== null && executedSurplusFee !== void 0 ? executedSurplusFee : executedFeeAmount;
    return Object.assign(Object.assign({}, dto), { totalFee });
}
/**
 * Transform order field for Native EthFlow orders
 *
 * A no-op for regular orders
 * For Native EthFlow, due to how the contract is setup:
 * - sellToken set to Native token address
 * - owner set to `onchainUser`
 * - validTo set to `ethflowData.userValidTo`
 */
function transformEthFlowOrder(order) {
    const { ethflowData } = order;
    if (!ethflowData) {
        return order;
    }
    const { userValidTo: validTo } = ethflowData;
    const owner = order.onchainUser || order.owner;
    const sellToken = contracts_1.BUY_ETH_ADDRESS;
    return Object.assign(Object.assign({}, order), { validTo, owner, sellToken });
}
//# sourceMappingURL=transformOrder.js.map