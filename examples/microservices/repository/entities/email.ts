import type { Repository } from '@nextorders/queue'
import { Entity } from '@nextorders/queue'
import { Events } from '../types'

export class Email extends Entity {
  constructor(repository: Repository) {
    super({
      name: 'email',
      eventsToConsume: [
        Events.UserCreated,
      ],
      repository,
    })
  }
}
