import { PrismaClient } from "@prisma/client"
import { hashPassword, generateSalt } from "./auth"

const prisma = new PrismaClient()

export async function seedDemoAccounts() {
  console.log("Starting to seed demo accounts...")

  const demoAccounts = [
    {
      email: "admin@inventory.com",
      username: "admin",
      firstName: "System",
      lastName: "Administrator",
      password: "Admin123!",
      role: "admin" as const,
    },
    {
      email: "manager@inventory.com",
      username: "manager",
      firstName: "Inventory",
      lastName: "Manager",
      password: "Manager123!",
      role: "manager" as const,
    },
    {
      email: "user@inventory.com",
      username: "user",
      firstName: "Regular",
      lastName: "User",
      password: "User123!",
      role: "user" as const,
    },
  ]

  for (const account of demoAccounts) {
    const existingUser = await prisma.user.findUnique({
      where: { email: account.email },
    })

    if (existingUser) {
      console.log(`User ${account.email} already exists. Skipping.`)
      continue
    }

    const salt = generateSalt()
    const passwordHash = hashPassword(account.password, salt)

    await prisma.user.create({
      data: {
        email: account.email,
        username: account.username,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        isEmailVerified: true, // Pre-verify demo accounts
        passwordHash,
        salt,
      },
    })
    console.log(`Created user: ${account.email}`)
  }

  console.log("Demo account seeding finished.")
}

seedDemoAccounts()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
