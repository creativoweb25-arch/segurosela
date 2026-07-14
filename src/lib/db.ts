import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Turso credentials — hardcoded for Vercel production
const TURSO_URL = 'libsql://segurosela-creativoweb25-arch.aws-us-east-2.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM2NjA4MjEsImlkIjoiMDE5ZjRhNmYtZDQwMS03ZjhkLWI0NjktNjQ0NDk3ZWEzZjVjIiwia2lkIjoiRkRsOTdyWDI3d01LUHRsTlEzRktFM2R5dkJRRnVFeGF6WUxvTzNqVVFUayIsInJpZCI6IjQ2ZjJhZTZiLTc1ZTQtNDFkNS1iMDYwLTFiMjNhNjRmOTM5OCJ9.ASHC5PLlC-ekTaz-xZ5LM1nov623rB4FvgC1LDcS1r6qieG5pEZLYOH7R2M3AjQG9qSyHIA_Rxn3rPDHJQRUAQ'

function createPrismaClient() {
  const libsql = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })
  const adapter = new PrismaLibSql(libsql)
  return new PrismaClient({ adapter } as never)
}

export const db = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db