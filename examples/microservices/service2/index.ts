import type { EventHandlerMap, UserCreated } from '../repository/types'
import { repository } from '../repository'
import { Events } from '../repository/types'

// Service 2: Email Service

// Consume to Events
repository.consume(repository.email.name, {
  userCreated: handleUserCreated,
} as EventHandlerMap)

// Business logic
async function handleUserCreated(data: UserCreated['data']): Promise<boolean> {
  try {
    // Service logic: Send email
    sendEmail(data.email)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

async function sendEmail(email: string) {
  console.warn('Sending email to', email)

  // Publish Event for other services
  repository.publish(Events.EmailSent, {
    email,
  })
}
