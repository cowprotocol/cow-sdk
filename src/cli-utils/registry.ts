import { cancelOrderSchema, createOrderSchema, getOrderSchema, getOrdersSchema, Schema } from './schemas'
import { CliOperation, CliOperations } from './types'
import { signOrderOperation } from './operations/signOrder'
import { sendOrderOperation } from './operations/sendOrder'
import { cancelOrderOperation } from './operations/cancelOrder'
import { getOrderOperation } from './operations/getOrder'
import { getOrdersOperation } from './operations/getOrders'

export const registry: { [key in CliOperations]: { schema: Schema; operation: CliOperation } } = {
  [CliOperations.signOrder]: {
    schema: createOrderSchema,
    operation: signOrderOperation,
  },
  [CliOperations.sendOrder]: {
    schema: createOrderSchema,
    operation: sendOrderOperation,
  },
  [CliOperations.cancelOrder]: {
    schema: cancelOrderSchema,
    operation: cancelOrderOperation,
  },
  [CliOperations.getOrder]: {
    schema: getOrderSchema,
    operation: getOrderOperation,
  },
  [CliOperations.getOrders]: {
    schema: getOrdersSchema,
    operation: getOrdersOperation,
  },
}
