import { ConfigError, loadConfig } from './config.js'

const valid = {
  DATABASE_URL: 'postgresql://way:way@localhost:5432/way_dev',
  JWT_SECRET: 'a'.repeat(32),
  CORS_ORIGIN: 'http://localhost:5173',
}

test('loads a valid env and applies defaults', () => {
  const c = loadConfig(valid)
  expect(c).toMatchObject({ NODE_ENV: 'development', HOST: '0.0.0.0', PORT: 3000 })
  expect(c.corsOrigins).toEqual(['http://localhost:5173'])
})

test('PORT is coerced from string and validated', () => {
  expect(loadConfig({ ...valid, PORT: '8080' }).PORT).toBe(8080)
  expect(() => loadConfig({ ...valid, PORT: 'abc' })).toThrow(ConfigError)
  expect(() => loadConfig({ ...valid, PORT: '0' })).toThrow(ConfigError)
  expect(() => loadConfig({ ...valid, PORT: '70000' })).toThrow(ConfigError)
})

test('CORS_ORIGIN accepts a comma separated list and trims it', () => {
  const c = loadConfig({ ...valid, CORS_ORIGIN: 'http://a.mn , https://b.mn ,' })
  expect(c.corsOrigins).toEqual(['http://a.mn', 'https://b.mn'])
})

test('a CORS_ORIGIN of only separators is rejected', () => {
  expect(() => loadConfig({ ...valid, CORS_ORIGIN: ' , , ' })).toThrow(/CORS_ORIGIN/)
})

test('missing variables are all reported by name', () => {
  try {
    loadConfig({})
    throw new Error('унах ёстой байсан')
  } catch (err) {
    expect(err).toBeInstanceOf(ConfigError)
    const msg = (err as ConfigError).message
    expect(msg).toContain('DATABASE_URL')
    expect(msg).toContain('JWT_SECRET')
    expect(msg).toContain('CORS_ORIGIN')
  }
})

test('a short JWT_SECRET is rejected', () => {
  expect(() => loadConfig({ ...valid, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/)
})

test('a non-postgres DATABASE_URL is rejected', () => {
  expect(() => loadConfig({ ...valid, DATABASE_URL: 'mysql://localhost/x' })).toThrow(/DATABASE_URL/)
  expect(loadConfig({ ...valid, DATABASE_URL: 'postgres://localhost/x' }).DATABASE_URL).toBeTruthy()
})

test('the error message never leaks the secret values', () => {
  const secret = 'super-secret-password-value'
  try {
    loadConfig({ ...valid, JWT_SECRET: secret, PORT: 'nope' })
    throw new Error('унах ёстой байсан')
  } catch (err) {
    expect((err as Error).message).not.toContain(secret)
  }
})

test('NODE_ENV only accepts the known environments', () => {
  expect(loadConfig({ ...valid, NODE_ENV: 'production' }).NODE_ENV).toBe('production')
  expect(() => loadConfig({ ...valid, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/)
})
