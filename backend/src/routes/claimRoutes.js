import express from "express"
import { createClaim, getClaims } from "../controllers/claimController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/", getClaims)
router.post("/", createClaim)

export default router