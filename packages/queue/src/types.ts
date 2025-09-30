import type { Cmd, Connection, Consumer, ConsumerStatus, MethodParams, Publisher } from 'rabbitmq-client'

export interface QueueRepository {
  connection: Connection
  publisher: Publisher
  exchanges: ExchangesList
  bindings: Binding[]
  queues: Queue[]
  connect: (connectionString: string) => Promise<void>
  checkHealth: () => boolean
  success: () => ConsumerStatus
  fail: () => ConsumerStatus
  ignore: () => ConsumerStatus
}

export interface QueueEntity {
  name: string
  eventsToConsume: string[]
  repository: QueueRepository
  consume: (handler: BaseEventHandler<unknown>) => Promise<Consumer>
}

/**
 * @example type EventMessage = BaseEventMessage<Events>
 */
export interface BaseEventMessage<T> {
  type: T
  data: any
}

/**
 * @example type EventMessageHandler = (message: BaseEventMessage<Events>) => Promise<ConsumerStatus>
 */
export type BaseEventHandler<T> = (message: BaseEventMessage<T>) => Promise<ConsumerStatus>

export type Queue = MethodParams[Cmd.QueueDeclare]
export type QueuesList = Record<string, Queue>

export type Binding = MethodParams[Cmd.QueueBind]
export type BindingsList = Record<string, Binding>

export type Exchange = MethodParams[Cmd.ExchangeDeclare]
export type ExchangesList = Record<'events' | 'fail' | 'retry', Exchange>
