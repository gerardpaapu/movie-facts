import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest'
import Path from 'node:path/posix'

const env = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  process.env = { ...env }
})

afterAll(() => {
  process.env = { ...env }
})
/**
 * I would never write this test, but we're chasing 100% coverage because
 * we've gone down a path, psychologically
 */
describe('connection', () => {
  it('loads the test config', async () => {
    process.env.NODE_ENV = 'test'
    const { default: db } = await import('../connection')
    expect(db.client.connectionSettings.filename).toBe(':memory:')
  })

  it('loads the development config', async () => {
    process.env.NODE_ENV = 'development'
    const { default: db } = await import('../connection')
    const path = Path.relative(__dirname, db.client.connectionSettings.filename)
    expect(path).toBe('../dev.sqlite3')
  })

  it('loads the development config (if undefined)', async () => {
    process.env.NODE_ENV = undefined
    const { default: db } = await import('../connection')
    const path = Path.relative(__dirname, db.client.connectionSettings.filename)
    expect(path).toBe('../dev.sqlite3')
  })

  // it('loads the production config', async () => {
  //   process.env.NODE_ENV = 'production'
  //   const { default: db } = await import('../connection')
  //   const path = db.client.connectionSettings
  //   expect(path).toBe('/app/storage/prod.sqlite3')
  // })
})
