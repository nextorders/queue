import type { UserCreated } from '../repository/types'
import { repository } from '../repository'
import { Events } from '../repository/types'

// Service 1: User Service
const body = {
  name: 'John Doe',
  email: '5Tt9o@example.com',
}

// DB: Save user in database
const newUser = {
  id: '123',
  ...body,
}

// Publish Event for other services
repository.publish<UserCreated>(Events.UserCreated, {
  id: newUser.id,
  name: newUser.name,
  email: newUser.email,
})
