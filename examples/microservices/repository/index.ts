import { Repository } from '@nextorders/queue'
import { Email } from './entities/email'
import { User } from './entities/user'

class QueueRepository extends Repository {
  user = new User(this)
  email = new Email(this)
}

export const repository = new QueueRepository()
