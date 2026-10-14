import { z } from 'zod'

/**
 * Орчны хувьсагчдын схем. Сервер ЭХЛЭХЭЭС ӨМНӨ шалгагдана — буруу бол
 * хагас ажиллахын оронд шууд унана (fail fast).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z
    .string()
    .refine((v) => /^postgres(ql)?:\/\//.test(v), 'postgres:// эсвэл postgresql:// хаягаар эхлэх ёстой'),
  /** Токен хуурамчлахаас сэргийлэхийн тулд урт байх ёстой. */
  JWT_SECRET: z.string().min(32, 'дор хаяж 32 тэмдэгт байх ёстой'),
  /** Нэг юм уу хэдэн origin, таслалаар зааглана. */
  CORS_ORIGIN: z.string().min(1),
})

export interface Config {
  NODE_ENV: 'development' | 'test' | 'production'
  HOST: string
  PORT: number
  DATABASE_URL: string
  JWT_SECRET: string
  corsOrigins: string[]
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

/**
 * Орчноос тохиргоо уншина. Алдааны мессежид хувьсагчийн НЭР ба шалтгаан
 * л орно — утга нь хэзээ ч орохгүй (нууц үг/токен лог руу гоожихоос сэргийлнэ).
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n')
    throw new ConfigError(`Орчны хувьсагчид буруу байна:\n${issues}`)
  }

  const { CORS_ORIGIN, ...rest } = parsed.data
  const corsOrigins = CORS_ORIGIN.split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (corsOrigins.length === 0) {
    throw new ConfigError('Орчны хувьсагчид буруу байна:\n  CORS_ORIGIN: дор хаяж нэг origin байх ёстой')
  }

  return { ...rest, corsOrigins }
}
