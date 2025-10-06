import type { QueueEntity, QueueRepository } from './types'

type EntityOptions = {
  name: string
  eventsToConsume: string[]
  repository: QueueRepository
}

export class Entity implements QueueEntity {
  name: string
  eventsToConsume: string[]
  repository: QueueRepository

  constructor({ name, eventsToConsume, repository }: EntityOptions) {
    this.name = name
    this.eventsToConsume = eventsToConsume
    this.repository = repository

    this.#initQueues(name)
    this.#initBindings(eventsToConsume)
  }

  #initQueues(name: string) {
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

  #initBindings(events: string[]) {
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
