const connectionErrorMarkers = [
  "Can't reach database server",
  "connect ECONNREFUSED",
  "Connection terminated unexpectedly",
  "DATABASE_URL is not configured"
]

const schemaErrorMarkers = [
  '_prisma_migrations',
  'relation "User" does not exist',
  'relation "Policy" does not exist',
  'relation "Claim" does not exist'
]

export const getDatabaseErrorResponse = (error) => {
  const message = error?.message ?? ""
  const errorCode = error?.code ?? error?.cause?.code
  const errorName = error?.name ?? error?.constructor?.name

  const isConnectionError =
    errorCode === "P1001" ||
    errorCode === "P1002" ||
    errorCode === "ECONNREFUSED" ||
    errorName === "PrismaClientInitializationError" ||
    connectionErrorMarkers.some((marker) => message.includes(marker))

  if (isConnectionError) {
    return {
      status: 503,
      error: "Database is unavailable. Run npm run db:start in backend and try again."
    }
  }

  const isSchemaError =
    errorCode === "P2021" ||
    schemaErrorMarkers.some((marker) => message.includes(marker))

  if (isSchemaError) {
    return {
      status: 503,
      error: "Database schema is not ready. Run npm run db:migrate:deploy in backend and try again."
    }
  }

  return null
}
