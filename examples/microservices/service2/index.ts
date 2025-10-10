import type { EmailSent, EventHandlerMap, UserCreated } from '../repository/types'
import { repository } from '../repository'
import { Events } from '../repository/types'

// Service 2: Email Service

// Subscribe to Events and handle them
repository.consume<EventHandlerMap>(repository.email.name, {
  userCreated: handleUserCreated,
})

// Business logic
async function handleUserCreated(data: UserCreated['data']): Promise<boolean> {
  try {
    await sendEmail(data.email)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

async function sendEmail(email: string) {
  console.warn('Sending email to', email)

  // Publish Event for other services
  await repository.publish<EmailSent>(Events.EmailSent, {
    email,
  })
}
