import type { Consumer } from 'rabbitmq-client'
import type { BaseEventHandler, QueueEntity, QueueRepository } from './types'

type EntityOptions = {
  name: string
  eventsToConsume: string[]
  repository: QueueRepository
}

export class Entity implements QueueEntity {
  name: string
  eventsToConsume: string[] = []
  repository: QueueRepository

  constructor({ name, eventsToConsume, repository }: EntityOptions) {
    this.name = name
    this.eventsToConsume = eventsToConsume
    this.repository = repository

    this.initQueues(name)
    this.initBindings(eventsToConsume)
  }

  async consume(handler: BaseEventHandler<unknown>): Promise<Consumer> {
    if (!this.queue?.queue) {
      throw new Error(`Queue "${this.name}" not found`)
    }

    const consumer = this.repository.connection.createConsumer({
      queue: this.queue.queue,
      queueOptions: {
        passive: true,
      },
      noAck: false,
      qos: {
        prefetchCount: 1,
      },
    }, async (msg) => handler(msg.body))

    consumer.on('error', (err) => {
      // Maybe the consumer was cancelled, or the connection was reset before a
      // message could be acknowledged.
      console.error('consumer error (telegram)', err)
    })

    return consumer
  }

  get queue() {
    return this.repository.queues.find((queue) => queue.queue === this.name)
  }

  private initQueues(name: string) {
    this.repository.queues.push({
      queue: name,
      arguments: {
        'x-queue-type': 'classic',
        'x-dead-letter-exchange': this.repository.exchanges.fail.exchange,
      },
      autoDelete: false,
      durable: true,
    },
    {
      queue: `${name}.retry.dlx`,
      arguments: {
        'x-queue-type': 'classic',
        'x-queue-mode': 'lazy',
        'x-dead-letter-exchange': this.repository.exchanges.retry.exchange,
        'x-message-ttl': 10000,
      },
      autoDelete: false,
      durable: true,
    })
  }

  private initBindings(events: string[]) {
    if (!events.length) {
      return
    }

    const eventsExchange = this.repository.exchanges.events.exchange
    const retryExchange = this.repository.exchanges.retry.exchange
    const failExchange = this.repository.exchanges.fail.exchange

    for (const event of events) {
      this.repository.bindings.push({
        queue: this.name,
        exchange: eventsExchange,
        routingKey: event,
      },
      {
        queue: this.name,
        exchange: retryExchange,
        routingKey: event,
      },
      {
        queue: `${this.name}.retry.dlx`,
        exchange: failExchange,
        routingKey: event,
      })
    }
  }
}
