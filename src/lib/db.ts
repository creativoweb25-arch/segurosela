import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Turso credentials — hardcoded as fallback when env vars are not available
const TURSO_URL = 'libsql://segurosela-creativoweb25-arch.aws-us-east-2.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM2NjA4MjEsImlkIjoiMDE5ZjRhNmYtZDQwMS03ZjhkLWI0NjktNjQ0NDk3ZWEzZjVjIiwia2lkIjoiRkRsOTcyWDI3d01LUHRsTlEzRktFM2R5dkJRRnVFeGF6WUxvTzNqVVFUayIsInJpZCI6IjQ2ZjJhZTZiLTc1ZTQtNDFkNS1iMDYwLTFiMjNhNjRmOTM5OCJ9.ASHC5PLlC-ekTaz-xZ5LM1nov623rB4FvgC1LDcS1r6qieG5pEZLYOH7R2M3AjQG9qSyHIA_Rxn3rPDHJQRUAQ'

function createPrismaClient() {
  // Try env vars first, fallback to hardcoded Turso credentials
  const url = process.env.DATABASE_URL || TURSO_URL
  const authToken = process.env.DATABASE_AUTH_TOKEN || TURSO_TOKEN

  // If using Turso (libsql://), use the LibSQL adapter
  if (url && url.startsWith('libsql://')) {
    const libsql = createClient({ url, authToken })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter } as never)
  }

  // Fallback to local SQLite (for development)
  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db