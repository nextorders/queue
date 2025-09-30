import type { Publisher } from 'rabbitmq-client'
import type { Binding, ExchangesList, Queue, QueueRepository } from './types'
import { Connection, ConsumerStatus } from 'rabbitmq-client'
import { COMMON_EXCHANGES } from './exchanges'

export class Repository implements QueueRepository {
  private _connection: Connection | null = null
  private _publisher: Publisher | null = null

  queues: Queue[] = []
  bindings: Binding[] = []
  exchanges: ExchangesList = COMMON_EXCHANGES

  success = () => ConsumerStatus.ACK
  fail = () => ConsumerStatus.DROP
  ignore = () => ConsumerStatus.REQUEUE

  checkHealth(): boolean {
    return this.connection.ready
  }

  async connect(connectionString: string) {
    this.initConnection(connectionString)

    await this.declareExchanges()
    await this.declareQueues()
    await this.declareBindings()
  }

  get publisher(): Publisher {
    if (!this._publisher) {
      this._publisher = this.connection.createPublisher({
        maxAttempts: 2,
        confirm: true,
      })

      return this._publisher
    }

    return this._publisher
  }

  get connection(): Connection {
    if (!this._connection) {
      throw new Error('Connection is not created')
    }

    return this._connection
  }

  private initConnection(connectionString: string): void {
    const connection = new Connection({
      url: connectionString,
    })

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error', err)
    })

    this._connection = connection
  }

  private async declareExchanges() {
    for (const [name, config] of Object.entries(this.exchanges)) {
      await this.connection.exchangeDeclare({
        exchange: name,
        type: config.type,
        autoDelete: config.autoDelete,
        durable: config.durable,
      })
    }
  }

  private async declareQueues() {
    for (const queue of this.queues) {
      await this.connection.queueDeclare({
        queue: queue.queue,
        arguments: queue.arguments,
        autoDelete: queue.autoDelete,
        durable: queue.durable,
      })
    }
  }

  private async declareBindings() {
    for (const binding of this.bindings) {
      await this.connection.queueBind({
        exchange: binding.exchange,
        queue: binding.queue,
        routingKey: binding.routingKey,
      })
    }
  }
}
