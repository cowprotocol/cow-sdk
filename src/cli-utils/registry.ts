import { cancelOrderSchema, createOrderSchema, Schema } from './schemas'
import { CliOperation, CliOperations } from './types'
import { signOrderOperation } from './operations/signOrder'
import { sendOrderOperation } from './operations/sendOrder'
import { cancelOrderOperation } from './operations/cancelOrder'

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
}
