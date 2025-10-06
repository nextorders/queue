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
  publish: <T extends BaseEventMessage>(event: T['event'], data: T['data']) => Promise<void>
  consume: <T extends BaseEventMessageHandler>(queue: string, eventHandlers: Record<string, T>) => Promise<Consumer>
  handleEvent: (eventHandlers: BaseEventHandlerMap, msg: BaseEventMessage) => Promise<Status>
  connect: (connectionString: string) => Promise<void>
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
 * @example export interface UserCreated extends BaseEventMessage {
 * event: 'userCreated'
 *   data: {
 *     id: string
 *     name: string
 *     email: string
 *   }
 * }
 */
export interface BaseEventMessage<T = Record<string, unknown>> {
  event: string
  data: T
}

export type BaseEventHandler<T = Record<string, unknown>> = (message: BaseEventMessage<T>) => Promise<ConsumerStatus>

export type BaseEventMessageHandler<T = Record<string, unknown>> = (data: T) => Promise<boolean>

export type BaseEventHandlerMap<T = Record<string, unknown>> = Record<string, BaseEventMessageHandler<T>>

export type Queue = MethodParams[Cmd.QueueDeclare]
export type QueuesList = Record<string, Queue>

export type Binding = MethodParams[Cmd.QueueBind]
export type BindingsList = Record<string, Binding>

export type Exchange = MethodParams[Cmd.ExchangeDeclare]
export type ExchangesList = Record<'events' | 'fail' | 'retry', Exchange>
