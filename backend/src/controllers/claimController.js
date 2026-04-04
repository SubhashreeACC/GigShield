import prisma from "../prismaClient.js"

export const createClaim = async (req, res) => {
  const { policyId, eventType, description, amount } = req.body

  if (!policyId || !eventType?.trim() || !description?.trim()) {
    return res.status(400).json({ error: "Policy, event type, and description are required" })
  }

  const parsedAmount = Number(amount)

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" })
  }

  try {
    const policy = await prisma.policy.findFirst({
      where: {
        id: policyId,
        userId: req.user.id
      }
    })

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" })
    }

    const claim = await prisma.claim.create({
      data: {
        policyId,
        eventType: eventType.trim(),
        description: description.trim(),
        amount: parsedAmount,
        userId: req.user.id
      }
    })

    res.status(201).json(claim)
  } catch (error) {
    res.status(500).json({ error: "Failed to create claim" })
  }
}

export const getClaims = async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    })

    res.json(claims)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch claims" })
  }
}
