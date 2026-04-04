import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import authRoutes from "./src/routes/authRoutes.js"
import policyRoutes from "./src/routes/policyRoutes.js"
import claimRoutes from "./src/routes/claimRoutes.js"
import premiumRoutes from "./src/routes/premiumRoutes.js"

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors())
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/auth", authRoutes)
app.use("/api/policies", policyRoutes)
app.use("/api/claims", claimRoutes)
app.use("/api/premium", premiumRoutes)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
