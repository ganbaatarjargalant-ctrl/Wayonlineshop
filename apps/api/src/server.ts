import { buildApp } from './app.js'
import { ConfigError, loadConfig } from './config.js'

async function main(): Promise<void> {
  let config
  try {
    config = loadConfig()
  } catch (err) {
    // Тохиргоо буруу бол логгер ч байхгүй — stderr руу шууд бичиж унана
    process.stderr.write(`${err instanceof ConfigError ? err.message : String(err)}\n`)
    process.exit(1)
  }

  const app = await buildApp(config)

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      app.log.info({ signal }, 'Сервер хаагдаж байна')
      void app.close().then(() => process.exit(0))
    })
  }

  try {
    await app.listen({ port: config.PORT, host: config.HOST })
  } catch (err) {
    app.log.error({ err }, 'Сервер эхлүүлж чадсангүй')
    process.exit(1)
  }
}

await main()
