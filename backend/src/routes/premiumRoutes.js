import express from "express"
import { calculatePremium } from "../services/policyService.js"

const router = express.Router()

router.post("/calculate", (req, res) => {
  const { vehicleType, hoursPerWeek, coverageCap } = req.body

  const premium = calculatePremium(vehicleType, hoursPerWeek, coverageCap)

  res.json({ premium })
})

export default router