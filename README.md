# Queue 🐰

[![npm version](https://badge.fury.io/js/%40nextorders%2Fqueue.svg)](https://www.npmjs.com/package/@nextorders/queue)

The `@nextorders/queue` is a TypeScript library designed to simplify working with RabbitMQ in Node.js applications. The library provides a high-level API for organizing message queues and processing business entities.

![RabbitMQ Dashboard](https://github.com/user-attachments/assets/b330e911-bc74-404d-9999-c720b04ca9f7)

## Key Features

- Type-safe operations with message queues
- Automatic connection to the RabbitMQ server
- Declarative creation of queues and exchanges
- Built-in error handling and retry mechanisms
- Support for various message types
- Flexible connection configuration

## Installation

You can install the library via npm:

```bash
npm install @nextorders/queue
```

## Usage

Prepare types:

```typescript
import type { BaseEventMessage } from '@nextorders/queue'

export enum Events {
  TICKET_MESSAGE_CREATED = 'ticketMessageCreated',
  OTHER_ACTION = 'otherAction',
}

export type EventMessage = BaseEventMessage<Events>

export interface TicketMessageCreated extends EventMessage {
  type: typeof Events.TICKET_MESSAGE_CREATED
  data: {
    ticketId: string
    ticketOwnerId: string
    messageId: string
    userId: string
    userName: string
    userSurname: string | undefined
    userText: string
  }
}
```

Create Entities:

```typescript
import { Entity, Repository } from '@nextorders/queue'

export class Telegram extends Entity {
  constructor(repository: Repository) {
    super({
      name: 'telegram',
      eventsToConsume: ['ticketMessageCreated'],
      repository,
    })
  }
}
```

Create Repository with Entities:

```typescript
import { Repository } from '@nextorders/queue'
import { Telegram, Ticket } from './entities'

class QueueRepository extends Repository {
  telegram: Telegram = new Telegram(this)
  ticket: Ticket = new Ticket(this)
}

export const repository = new QueueRepository()
```

On server start (for example in Nuxt server plugin):

```typescript
await repository.connect(process.env.QUEUE_URL)
```

And thats it! Use repository in app:

```typescript
// Publisher
await repository.publisher.send({
  exchange: repository.exchanges.events.exchange,
  routingKey: Events.TICKET_MESSAGE_CREATED,
}, body)

// Consumer
await repository.telegram.consume(async (msg) => {
  if (msg.type === 'ticketMessageCreated') {
    return handleTicketMessageCreated(msg) // ack on finish
  }

  return queue.ignore()
})
```

## License

This project is licensed under the MIT License.
