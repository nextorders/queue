import type { Consumer, Publisher } from 'rabbitmq-client'
import type { BaseEventMap, BaseEventMessage, BaseEventMessageHandlerMap, Binding, ExchangesList, Queue, QueueRepository, Status } from './types'
import { Connection, ConsumerStatus } from 'rabbitmq-client'
import { COMMON_EXCHANGES } from './exchanges'

export class Repository implements QueueRepository {
  #connection: Connection | null = null
  #publisher: Publisher | null = null

  queues: Queue[] = []
  bindings: Binding[] = []
  exchanges: ExchangesList = COMMON_EXCHANGES

  success = () => ConsumerStatus.ACK
  fail = () => ConsumerStatus.DROP
  ignore = () => ConsumerStatus.REQUEUE

  checkHealth(): boolean {
    return this.connection.ready
  }

  /**
   * Create a connection to RabbitMQ
   * @param connectionString
   * @param retryCount
   * @returns Promise<void>
   */
  async connect(connectionString: string, retryCount = 5): Promise<void> {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        await this.#initConnection(connectionString)
        break
      } catch (err) {
        console.error('RabbitMQ: Failed to connect. Retrying...', err)
        if (attempt === retryCount) {
          throw new Error('RabbitMQ: Failed to connect after some retries')
        }
        // basic exponential backoff capped at 10s
        const delay = Math.min(1000 * 2 ** (attempt - 1), 10_000)
        await new Promise((res) => setTimeout(res, delay))
      }
    }

    try {
      await this.#declareExchanges()
      await this.#declareQueues()
      await this.#declareBindings()
    } catch (error) {
      console.error('RabbitMQ: Failed to declare exchanges, queues, and bindings', error)
    }
  }

  get publisher(): Publisher {
    if (!this.#publisher) {
      this.#publisher = this.connection.createPublisher({
        maxAttempts: 2,
        confirm: true,
      })

      return this.#publisher
    }

    return this.#publisher
  }

  get connection(): Connection {
    if (!this.#connection) {
      throw new Error('Connection is not created')
    }

    return this.#connection
  }

  async publish<T extends BaseEventMessage<any>>(event: T['event'], data: T['data']) {
    return this.publisher.send({
      exchange: this.exchanges.events.exchange,
      routingKey: event,
    }, {
      event,
      data,
    })
  }

  async consume<T extends BaseEventMessageHandlerMap<BaseEventMap<any>>>(queue: string, eventHandlers: T): Promise<Consumer> {
    if (!queue) {
      throw new Error(`Queue "${queue}" not found`)
    }

    const consumer = this.connection.createConsumer({
      queue,
      queueOptions: {
        passive: true,
      },
      noAck: false,
      qos: {
        prefetchCount: 1,
      },
    }, async (msg) => this.#handleEvent(eventHandlers, msg.body))

    consumer.on('error', (err) => {
      // Maybe the consumer was cancelled, or the connection was reset before a
      // message could be acknowledged.
      console.error('consumer error', err)
    })

    return consumer
  }

  async #handleEvent(eventHandlers: BaseEventMessageHandlerMap<BaseEventMap<any>>, msg: BaseEventMessage<any>): Promise<Status> {
    const handler = eventHandlers[msg.event]
    if (!handler) {
      return this.ignore()
    }

    try {
      return await handler(msg.data) ? this.success() : this.fail()
    } catch (error) {
      console.error('Error handling message:', error)
      return this.fail()
    }
  }

  async #initConnection(connectionString: string): Promise<void> {
    const connection = new Connection({
      url: connectionString,
    })

    connection.on('connection', () => {
      // eslint-disable-next-line no-console
      console.debug('RabbitMQ connection is successfully (re)established')
    })

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error', err)
    })

    // Wait for connection to be ready
    await connection.onConnect(80_000)

    this.#connection = connection
  }

  async #declareExchanges() {
    for (const [name, config] of Object.entries(this.exchanges)) {
      await this.connection.exchangeDeclare({
        exchange: name,
        type: config.type,
        autoDelete: config.autoDelete,
        durable: config.durable,
      })
    }
  }

  async #declareQueues() {
    for (const queue of this.queues) {
      await this.connection.queueDeclare({
        queue: queue.queue,
        arguments: queue.arguments,
        autoDelete: queue.autoDelete,
        durable: queue.durable,
      })
    }
  }

  async #declareBindings() {
    for (const binding of this.bindings) {
      await this.connection.queueBind({
        exchange: binding.exchange,
        queue: binding.queue,
        routingKey: binding.routingKey,
      })
    }
  }
}
