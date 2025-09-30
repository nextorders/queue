import type { ExchangesList } from './types'

export const COMMON_EXCHANGES: ExchangesList = {
  events: {
    exchange: 'events' as const,
    type: 'direct' as const,
    autoDelete: false,
    durable: true,
  },
  fail: {
    exchange: 'fail' as const,
    type: 'direct' as const,
    autoDelete: false,
    durable: true,
  },
  retry: {
    exchange: 'retry' as const,
    type: 'direct' as const,
    autoDelete: false,
    durable: true,
  },
}
