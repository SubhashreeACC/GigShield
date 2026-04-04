import prisma from "../prismaClient.js"
import { calculatePremium } from "../services/policyService.js"
import { getDatabaseErrorResponse } from "../utils/databaseErrors.js"

export const getPolicies = async (req, res) => {
  try {
    const data = await prisma.policy.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    })

    res.json(data)
  } catch (error) {
    const databaseError = getDatabaseErrorResponse(error)

    if (databaseError) {
      return res.status(databaseError.status).json({ error: databaseError.error })
    }

    console.error("getPolicies failed", error)
    res.status(500).json({ error: "Failed to fetch policies" })
  }
}

export const createPolicy = async (req, res) => {
  const { vehicleType, hoursPerWeek, coverageCap } = req.body

  if (!req.body.city?.trim()) {
    return res.status(400).json({ error: "City is required" })
  }

  if (!vehicleType?.trim()) {
    return res.status(400).json({ error: "Vehicle type is required" })
  }

  try {
    const premium = calculatePremium(vehicleType, hoursPerWeek, coverageCap)

    const policy = await prisma.policy.create({
      data: {
        city: req.body.city.trim(),
        vehicleType: vehicleType.trim().toLowerCase(),
        coverageCap: Number(coverageCap),
        hoursPerWeek: Number(hoursPerWeek),
        premium,
        userId: req.user.id
      }
    })

    res.status(201).json(policy)
  } catch (error) {
    const databaseError = getDatabaseErrorResponse(error)

    if (databaseError) {
      return res.status(databaseError.status).json({ error: databaseError.error })
    }

    const statusCode = error.message?.includes("Unsupported vehicle type") ||
      error.message?.includes("must be a positive number")
      ? 400
      : 500

    if (statusCode === 500) {
      console.error("createPolicy failed", error)
    }

    res.status(statusCode).json({
      error: statusCode === 400 ? error.message : "Failed to create policy"
    })
  }
}
