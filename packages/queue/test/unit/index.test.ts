import { describe, expect, it } from 'vitest'
import { Repository } from '../../src/index'

describe('index', () => {
  describe('repository', () => {
    it('should be defined', () => {
      expect(typeof Repository).toBe('function')
    })
  })
})
