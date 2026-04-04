import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import authRoutes from "../backend/src/routes/authRoutes.js"
import policyRoutes from "../backend/src/routes/policyRoutes.js"
import claimRoutes from "../backend/src/routes/claimRoutes.js"
import premiumRoutes from "../backend/src/routes/premiumRoutes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/auth", authRoutes)
app.use("/api/policies", policyRoutes)
app.use("/api/claims", claimRoutes)
app.use("/api/premium", premiumRoutes)

export default app
