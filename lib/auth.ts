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

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Password hashing utilities (in production, use bcrypt or similar)
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Mock database operations (in production, use a real database)
const USERS_KEY = "inventory_users"
const SESSIONS_KEY = "inventory_sessions"
const RESET_TOKENS_KEY = "inventory_reset_tokens"
const VERIFICATION_TOKENS_KEY = "inventory_verification_tokens"

export interface StoredUser extends User {
  passwordHash: string
  salt: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: string
  createdAt: string
}

export interface ResetToken {
  token: string
  userId: string
  expiresAt: string
  used: boolean
}

export interface VerificationToken {
  token: string
  userId: string
  expiresAt: string
  used: boolean
}

export interface Invitation {
  id: string
  email: string
  token: string
  role: "admin" | "manager" | "user"
  createdBy: string
  createdAt: string
  expiresAt: string
  used: boolean
  usedAt?: string
  usedBy?: string
}

// User storage operations
export function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

export function saveUser(user: StoredUser): void {
  if (typeof window === "undefined") return
  const users = getStoredUsers()
  const existingIndex = users.findIndex((u) => u.id === user.id)

  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserByEmail(email: string): StoredUser | null {
  const users = getStoredUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export function findUserById(id: string): StoredUser | null {
  const users = getStoredUsers()
  return users.find((u) => u.id === id) || null
}

// Session management
export function createSession(userId: string): Session {
  const session: Session = {
    id: generateToken(),
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    createdAt: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    const sessions = getSessions()
    sessions.push(session)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
    localStorage.setItem("auth_session", session.id)
  }

  return session
}

export function getSessions(): Session[] {
  if (typeof window === "undefined") return []
  const sessions = localStorage.getItem(SESSIONS_KEY)
  return sessions ? JSON.parse(sessions) : []
}

export function getValidSession(): Session | null {
  if (typeof window === "undefined") return null

  const sessionId = localStorage.getItem("auth_session")
  if (!sessionId) return null

  const sessions = getSessions()
  const session = sessions.find((s) => s.id === sessionId)

  if (!session || new Date(session.expiresAt) < new Date()) {
    clearSession()
    return null
  }

  return session
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_session")
}

// Password reset tokens
export function createResetToken(userId: string): ResetToken {
  const token: ResetToken = {
    token: generateToken(),
    userId,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    used: false,
  }

  if (typeof window !== "undefined") {
    const tokens = getResetTokens()
    tokens.push(token)
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens))
  }

  return token
}

export function getResetTokens(): ResetToken[] {
  if (typeof window === "undefined") return []
  const tokens = localStorage.getItem(RESET_TOKENS_KEY)
  return tokens ? JSON.parse(tokens) : []
}

export function findValidResetToken(token: string): ResetToken | null {
  const tokens = getResetTokens()
  const resetToken = tokens.find((t) => t.token === token && !t.used)

  if (!resetToken || new Date(resetToken.expiresAt) < new Date()) {
    return null
  }

  return resetToken
}

export function markResetTokenUsed(token: string): void {
  if (typeof window === "undefined") return

  const tokens = getResetTokens()
  const tokenIndex = tokens.findIndex((t) => t.token === token)

  if (tokenIndex >= 0) {
    tokens[tokenIndex].used = true
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens))
  }
}

// Email verification tokens
export function createVerificationToken(userId: string): VerificationToken {
  const token: VerificationToken = {
    token: generateToken(),
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    used: false,
  }

  if (typeof window !== "undefined") {
    const tokens = getVerificationTokens()
    tokens.push(token)
    localStorage.setItem(VERIFICATION_TOKENS_KEY, JSON.stringify(tokens))
  }

  return token
}

export function getVerificationTokens(): VerificationToken[] {
  if (typeof window === "undefined") return []
  const tokens = localStorage.getItem(VERIFICATION_TOKENS_KEY)
  return tokens ? JSON.parse(tokens) : []
}

export function findValidVerificationToken(token: string): VerificationToken | null {
  const tokens = getVerificationTokens()
  const verificationToken = tokens.find((t) => t.token === token && !t.used)

  if (!verificationToken || new Date(verificationToken.expiresAt) < new Date()) {
    return null
  }

  return verificationToken
}

export function markVerificationTokenUsed(token: string): void {
  if (typeof window === "undefined") return

  const tokens = getVerificationTokens()
  const tokenIndex = tokens.findIndex((t) => t.token === token)

  if (tokenIndex >= 0) {
    tokens[tokenIndex].used = true
    localStorage.setItem(VERIFICATION_TOKENS_KEY, JSON.stringify(tokens))
  }
}

// Invitation storage operations
const INVITATIONS_KEY = "inventory_invitations"

export function getInvitations(): Invitation[] {
  if (typeof window === "undefined") return []
  const invitations = localStorage.getItem(INVITATIONS_KEY)
  return invitations ? JSON.parse(invitations) : []
}

export function saveInvitation(invitation: Invitation): void {
  if (typeof window === "undefined") return
  const invitations = getInvitations()
  const existingIndex = invitations.findIndex((i) => i.id === invitation.id)

  if (existingIndex >= 0) {
    invitations[existingIndex] = invitation
  } else {
    invitations.push(invitation)
  }

  localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations))
}

export function findValidInvitation(token: string): Invitation | null {
  const invitations = getInvitations()
  const invitation = invitations.find((i) => i.token === token && !i.used)

  if (!invitation || new Date(invitation.expiresAt) < new Date()) {
    return null
  }

  return invitation
}

export function markInvitationUsed(token: string, userId: string): void {
  if (typeof window === "undefined") return

  const invitations = getInvitations()
  const invitationIndex = invitations.findIndex((i) => i.token === token)

  if (invitationIndex >= 0) {
    invitations[invitationIndex].used = true
    invitations[invitationIndex].usedAt = new Date().toISOString()
    invitations[invitationIndex].usedBy = userId
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations))
  }
}

export function createInvitation(email: string, role: "admin" | "manager" | "user", createdBy: string): Invitation {
  const invitation: Invitation = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    token: generateToken(),
    role,
    createdBy,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    used: false,
  }

  saveInvitation(invitation)
  return invitation
}

// Mock email service
export function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  return new Promise((resolve) => {
    // In production, integrate with email service like SendGrid, AWS SES, etc.
    console.log(`Verification email sent to ${email}`)
    console.log(`Verification link: ${window.location.origin}/verify-email?token=${token}`)

    // Show alert for demo purposes
    alert(`Verification email sent to ${email}. Check console for verification link.`)

    setTimeout(() => resolve(true), 1000)
  })
}

export function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  return new Promise((resolve) => {
    // In production, integrate with email service
    console.log(`Password reset email sent to ${email}`)
    console.log(`Reset link: ${window.location.origin}/reset-password?token=${token}`)

    // Show alert for demo purposes
    alert(`Password reset email sent to ${email}. Check console for reset link.`)

    setTimeout(() => resolve(true), 1000)
  })
}

// Mock invitation email service
export function sendInvitationEmail(email: string, token: string, inviterName: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`Invitation email sent to ${email}`)
    console.log(`Invitation link: ${window.location.origin}/register?token=${token}`)
    console.log(`Invited by: ${inviterName}`)

    // Show alert for demo purposes
    alert(`Invitation sent to ${email}. Check console for invitation link.`)

    setTimeout(() => resolve(true), 1000)
  })
}
