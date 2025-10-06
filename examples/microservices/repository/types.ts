import type { BaseEventMessage, Status } from '@nextorders/queue'

// All possible events
export enum Events {
  UserCreated = 'userCreated',
  EmailSent = 'emailSent',
}

export type EventMessage = UserCreated | EmailSent

export type EventHandler = (msg: EventMessage) => Promise<Status>
export type EventMessageHandler<T = EventMessage['data']> = (data: T) => Promise<boolean>

export type EventHandlerMap = Record<EventMessage['event'], EventMessageHandler>

export interface UserCreated extends BaseEventMessage {
  event: Events.UserCreated
  data: {
    id: string
    name: string
    email: string
  }
}

export interface EmailSent extends BaseEventMessage {
  event: Events.EmailSent
  data: {
    email: string
  }
}
