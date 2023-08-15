import { describe, it, expect, vi } from 'vitest'
import config from '../knexfile'

/**
 * So ... I wouldn't necessarily write this test. The LOC paid vs. confidence
 * gained isn't really worth it, but if you were obsessed with coverage stats
 * this is a way you can test it.
 */
describe('afterCreate PRAGMA', () => {
  it('enforces foreign keys (development)', () => {
    const cb = {}
    const db = { run: vi.fn() }
    config.development.pool.afterCreate(db, cb)
    expect(db.run).toHaveBeenCalledWith('PRAGMA foreign_keys = ON', cb)
  })
})
