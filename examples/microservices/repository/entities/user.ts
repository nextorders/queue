import type { Repository } from '@nextorders/queue'
import { Entity } from '@nextorders/queue'

export class User extends Entity {
  constructor(repository: Repository) {
    super({
      name: 'user',
      eventsToConsume: [],
      repository,
    })
  }
}
