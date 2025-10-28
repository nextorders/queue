import type { Cmd, Connection, Consumer, MethodParams, Publisher } from 'rabbitmq-client'
import { ConsumerStatus } from 'rabbitmq-client'

const _statuses = {
  ACK: ConsumerStatus.ACK,
  DROP: ConsumerStatus.DROP,
  REQUEUE: ConsumerStatus.REQUEUE,
} as const

export type Status = typeof _statuses[keyof typeof _statuses]

export interface QueueRepository {
  connection: Connection
  publisher: Publisher
  exchanges: ExchangesList
  bindings: Binding[]
  queues: Queue[]
  publish: <T extends BaseEventMessage<any>>(event: T['event'], data: T['data']) => Promise<void>
  consume: <T extends BaseEventMessageHandlerMap<BaseEventMap<any>>>(queue: string, eventHandlers: T) => Promise<Consumer>
  connect: (connectionString: string, retryCount?: number) => Promise<void>
  checkHealth: () => boolean
  success: () => Status
  fail: () => Status
  ignore: () => Status
}

export interface QueueEntity {
  name: string
  eventsToConsume: string[]
  repository: QueueRepository
}

/**
 * @example export interface UserCreated extends BaseEventMessage<{
 *     id: string
 *     name: string
 *     email: string
 *   }> {
 *   event: 'userCreated'
 * }
 */
export interface BaseEventMessage<T> {
  event: string
  data: T
}

export type BaseEventMessageHandler<T> = (data: T) => Promise<boolean>

export type BaseEventMap<T extends Record<string, any>> = {
  [K in T as K['event']]: K
}

export type BaseEventMessageHandlerMap<T extends BaseEventMap<any>> = {
  [K in keyof T]: BaseEventMessageHandler<T[K]['data']>
}

export type DistributePick<T, K extends keyof any> = T extends any ? Pick<T, Extract<keyof T, K>> : never

export type Queue = MethodParams[Cmd.QueueDeclare]
export type QueuesList = Record<string, Queue>

export type Binding = MethodParams[Cmd.QueueBind]
export type BindingsList = Record<string, Binding>

export type Exchange = MethodParams[Cmd.ExchangeDeclare]
export type ExchangesList = Record<'events' | 'fail' | 'retry', Exchange>
