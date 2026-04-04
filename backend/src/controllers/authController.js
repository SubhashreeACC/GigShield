import prisma from "../prismaClient.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const sanitizeUser = ({ password, ...user }) => user

// REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword
      }
    })

    res.status(201).json(sanitizeUser(user))
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already registered" })
    }

    res.status(500).json({ error: "Registration failed" })
  }
}

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: "Email and password are required" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (!user) return res.status(400).json({ error: "User not found" })

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) return res.status(400).json({ error: "Invalid password" })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({ token, user: sanitizeUser(user) })
  } catch (error) {
    res.status(500).json({ error: "Login failed" })
  }
}
