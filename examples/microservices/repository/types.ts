import type { BaseEventMap, BaseEventMessage, BaseEventMessageHandlerMap } from '@nextorders/queue'

// All possible events
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
