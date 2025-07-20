import { saveUser, type StoredUser, hashPassword, generateSalt } from "./auth"

export function seedDemoAccounts() {
  // Check if demo accounts already exist
  const existingUsers = JSON.parse(localStorage.getItem("inventory_users") || "[]")
  if (existingUsers.length > 0) return

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

  demoAccounts.forEach((account) => {
    const salt = generateSalt()
    const passwordHash = hashPassword(account.password, salt)

    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: account.email,
      username: account.username,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      isEmailVerified: true, // Pre-verify demo accounts
      createdAt: new Date().toISOString(),
      passwordHash,
      salt,
    }

    saveUser(user)
  })

  console.log("Demo accounts created - Use admin account to invite new users:")
  console.log("Admin: admin@inventory.com / Admin123!")
  console.log("Manager: manager@inventory.com / Manager123!")
  console.log("User: user@inventory.com / User123!")
}
