# Queue 🐰

[![npm version](https://badge.fury.io/js/%40nextorders%2Fqueue.svg)](https://www.npmjs.com/package/@nextorders/queue)

The `@nextorders/queue` is a TypeScript library designed to simplify working with RabbitMQ in Node.js applications. The library provides a high-level API for organizing message queues and processing business entities.

![RabbitMQ Dashboard](https://github.com/user-attachments/assets/b330e911-bc74-404d-9999-c720b04ca9f7)

## 😨 Key Features

- Type-safe operations with message queues
- Automatic connection to the RabbitMQ server
- Declarative creation of queues and exchanges
- Built-in error handling and retry mechanisms
- Support for various message types
- Flexible connection configuration

## 📦 Installation

You can install the library via npm:

```bash
npm install @nextorders/queue
```

## 🚀 Usage

### 1. Define Event Types

Create type definitions for your events:

```typescript
import type { BaseEventMap, BaseEventMessage, BaseEventMessageHandlerMap } from '@nextorders/queue'

export enum Events {
  UserCreated = 'userCreated',
  EmailSent = 'emailSent',
}

type EventMessage = UserCreated | EmailSent
type EventMap = BaseEventMap<EventMessage>

export type EventHandlerMap = Partial<BaseEventMessageHandlerMap<EventMap>>

type UserCreatedData = {
  id: string
  name: string
  email: string
}
export interface UserCreated extends BaseEventMessage<UserCreatedData> {
  event: typeof Events.UserCreated
}

type EmailSentData = {
  email: string
}
export interface EmailSent extends BaseEventMessage<EmailSentData> {
  event: typeof Events.EmailSent
}
```

### 2. Create Entities

Define entities that represent your services:

```typescript
import { Entity, Repository } from '@nextorders/queue'
import { Events } from './types'

export class User extends Entity {
  constructor(repository: Repository) {
    super({
      name: 'user',
      eventsToConsume: [],
      repository,
    })
  }
}

export class Email extends Entity {
  constructor(repository: Repository) {
    super({
      name: 'email',
      eventsToConsume: [Events.UserCreated],
      repository,
    })
  }
}
```

### 3. Create Repository

Create a repository that manages your entities:

```typescript
import type { EventMessage } from './types'
import { Repository } from '@nextorders/queue'
import { Email, User } from './entities'

class QueueRepository extends Repository {
  user: User = new User(this)
  email: Email = new Email(this)
}

export const repository = new QueueRepository()
```

### 4. Connect to RabbitMQ

On service start, connect to your RabbitMQ instance:

```typescript
import { repository } from './repository'

await repository.connect('amqp://guest:guest@localhost:5672')
```

### 5. Publish Events

Create and publish events from your services:

```typescript
await repository.publish<UserCreated>(Events.UserCreated, {
  id: newUser.id,
  name: newUser.name,
  email: newUser.email,
})
```

### 6. Consume Events

Subscribe to events and handle them:

```typescript
import type { EmailSent, EventHandlerMap, UserCreated } from '../repository/types'
import { repository } from '../repository'
import { Events } from '../repository/types'

// Subscribe to Events and handle them
repository.consume<EventHandlerMap>(repository.email.name, {
  userCreated: handleUserCreated,
})

// Define event handlers
async function handleUserCreated(data: UserCreated['data']): Promise<boolean> {
  try {
    await sendEmail(data.email)
    return true
  } catch (error) {
    console.error('Error handling UserCreated event:', error)
    return false
  }
}

async function sendEmail(email: string): Promise<void> {
  console.warn('Sending email to:', email)

  // Publish Event for other services
  await repository.publish<EmailSent>(Events.EmailSent, {
    email,
  })
}
```

## 💁‍♂️ Example: Microservices Architecture

Check out the examples/microservices directory for a complete working example with:

- Service 1: User creation service
- Service 2: Email notification service
- Shared repository with entities
- Type-safe event definitions

## 🤝 License

This project is licensed under the MIT License.
