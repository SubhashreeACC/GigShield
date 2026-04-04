import express from "express"
import { getPolicies, createPolicy } from "../controllers/policyController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/", getPolicies)
router.post("/", createPolicy)

export default router