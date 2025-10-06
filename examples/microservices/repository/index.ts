import type { EventMessage } from './types'
import { Repository } from '@nextorders/queue'
import { Email } from './entities/email'
import { User } from './entities/user'

class QueueRepository extends Repository {
  user = new User(this)
  email = new Email(this)

  async publish<T extends EventMessage>(event: T['event'], data: T['data']) {
    return super.publish(event, data)
  }
}

export const repository = new QueueRepository()
