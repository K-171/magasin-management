import { createHash, randomBytes } from "crypto"

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: "admin" | "manager" | "user"
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt?: string
}

// Password hashing utilities
export function hashPassword(password: string, salt: string): string {
  return createHash("sha256")
    .update(password + salt)
    .digest("hex")
}

export function generateSalt(): string {
  return randomBytes(32).toString("hex")
}

export function generateToken(): string {
  return randomBytes(32).toString("hex")
}

// Password validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return { valid: errors.length === 0, errors }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^
@]+@[^
@]+\.[^
@]+$/;
  return emailRegex.test(email);
}
