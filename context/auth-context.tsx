"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useNotification } from "./notification-context"
import type { User, AuthState, Invitation } from "@/lib/auth"
import {
  getValidSession,
  findUserById,
  clearSession,
  createSession,
  findUserByEmail,
  hashPassword,
  generateSalt,
  saveUser,
  validatePassword,
  validateEmail,
  createVerificationToken,
  sendVerificationEmail,
  createResetToken,
  sendPasswordResetEmail,
  findValidResetToken,
  markResetTokenUsed,
  findValidVerificationToken,
  markVerificationTokenUsed,
  findValidInvitation,
  markInvitationUsed,
  createInvitation as createInvitationToken,
  sendInvitationEmail,
  getInvitations as getStoredInvitations,
  saveInvitation,
  type StoredUser,
} from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData, invitationToken?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  createInvitation: (email: string, role: "admin" | "manager" | "user") => Promise<{ success: boolean; error?: string }>
  getInvitations: () => Invitation[]
  revokeInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
  role?: "admin" | "manager" | "user"
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })
  const router = useRouter()
  const { addNotification } = useNotification()

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const session = getValidSession()
      if (session) {
        const user = findUserById(session.userId)
        if (user) {
          const { passwordHash, salt, ...userWithoutPassword } = user
          setAuthState({
            user: userWithoutPassword,
            isAuthenticated: true,
            isLoading: false,
          })
          return
        }
      }

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = findUserByEmail(email)
      if (!user) {
        return { success: false, error: "Invalid email or password" }
      }

      const hashedPassword = hashPassword(password, user.salt)
      if (hashedPassword !== user.passwordHash) {
        return { success: false, error: "Invalid email or password" }
      }

      if (!user.isEmailVerified) {
        return { success: false, error: "Please verify your email address before logging in" }
      }

      // Update last login
      const updatedUser: StoredUser = {
        ...user,
        lastLoginAt: new Date().toISOString(),
      }
      saveUser(updatedUser)

      // Create session
      createSession(user.id)

      const { passwordHash, salt, ...userWithoutPassword } = updatedUser
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: "Login failed. Please try again." }
    }
  }

  const register = async (
    data: RegisterData,
    invitationToken?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate invitation token
      if (!invitationToken) {
        return { success: false, error: "Registration is by invitation only" }
      }

      const invitation = findValidInvitation(invitationToken)
      if (!invitation) {
        return { success: false, error: "Invalid or expired invitation" }
      }

      if (invitation.email.toLowerCase() !== data.email.toLowerCase()) {
        return { success: false, error: "Email does not match invitation" }
      }

      // Validate input
      if (!validateEmail(data.email)) {
        return { success: false, error: "Please enter a valid email address" }
      }

      const passwordValidation = validatePassword(data.password)
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors[0] }
      }

      // Check if user already exists
      const existingUser = findUserByEmail(data.email)
      if (existingUser) {
        return { success: false, error: "An account with this email already exists" }
      }

      // Create new user with role from invitation
      const salt = generateSalt()
      const passwordHash = hashPassword(data.password, salt)

      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        email: data.email.toLowerCase(),
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        role: invitation.role, // Use role from invitation
        isEmailVerified: true, // Auto-verify invited users
        createdAt: new Date().toISOString(),
        passwordHash,
        salt,
      }

      saveUser(newUser)

      // Mark invitation as used
      markInvitationUsed(invitationToken, newUser.id)

      addNotification(`New user registered: ${newUser.email}`, `/admin?highlight=${newUser.id}`)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Registration failed. Please try again." }
    }
  }

  const logout = () => {
    clearSession()
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    
  }

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = findUserByEmail(email)
      if (!user) {
        // Don't reveal if email exists for security
        return { success: true }
      }

      const resetToken = createResetToken(user.id)
      await sendPasswordResetEmail(user.email, resetToken.token)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to send reset email. Please try again." }
    }
  }

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const resetToken = findValidResetToken(token)
      if (!resetToken) {
        return { success: false, error: "Invalid or expired reset token" }
      }

      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors[0] }
      }

      const user = findUserById(resetToken.userId)
      if (!user) {
        return { success: false, error: "User not found" }
      }

      // Update password
      const salt = generateSalt()
      const passwordHash = hashPassword(newPassword, salt)

      const updatedUser: StoredUser = {
        ...user,
        passwordHash,
        salt,
      }
      saveUser(updatedUser)

      // Mark token as used
      markResetTokenUsed(token)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Password reset failed. Please try again." }
    }
  }

  const verifyEmail = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const verificationToken = findValidVerificationToken(token)
      if (!verificationToken) {
        return { success: false, error: "Invalid or expired verification token" }
      }

      const user = findUserById(verificationToken.userId)
      if (!user) {
        return { success: false, error: "User not found" }
      }

      // Mark email as verified
      const updatedUser: StoredUser = {
        ...user,
        isEmailVerified: true,
      }
      saveUser(updatedUser)

      // Mark token as used
      markVerificationTokenUsed(token)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Email verification failed. Please try again." }
    }
  }

  const resendVerification = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = findUserByEmail(email)
      if (!user) {
        return { success: false, error: "User not found" }
      }

      if (user.isEmailVerified) {
        return { success: false, error: "Email is already verified" }
      }

      const verificationToken = createVerificationToken(user.id)
      await sendVerificationEmail(user.email, verificationToken.token)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to send verification email. Please try again." }
    }
  }

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user) {
        return { success: false, error: "Not authenticated" }
      }

      const user = findUserById(authState.user.id)
      if (!user) {
        return { success: false, error: "User not found" }
      }

      const updatedUser: StoredUser = {
        ...user,
        ...data,
      }
      saveUser(updatedUser)

      const { passwordHash, salt, ...userWithoutPassword } = updatedUser
      setAuthState((prev) => ({
        ...prev,
        user: userWithoutPassword,
      }))

      return { success: true }
    } catch (error) {
      return { success: false, error: "Profile update failed. Please try again." }
    }
  }

  const createInvitation = async (
    email: string,
    role: "admin" | "manager" | "user",
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user) {
        return { success: false, error: "Not authenticated" }
      }

      if (authState.user.role !== "admin") {
        return { success: false, error: "Only administrators can create invitations" }
      }

      // Check if user already exists
      const existingUser = findUserByEmail(email)
      if (existingUser) {
        return { success: false, error: "User with this email already exists" }
      }

      // Check if invitation already exists
      const existingInvitations = getStoredInvitations()
      const pendingInvitation = existingInvitations.find(
        (inv) => inv.email.toLowerCase() === email.toLowerCase() && !inv.used && new Date(inv.expiresAt) > new Date(),
      )
      if (pendingInvitation) {
        return { success: false, error: "Invitation already sent to this email" }
      }

      const invitation = createInvitationToken(email, role, authState.user.id)
      await sendInvitationEmail(email, invitation.token, `${authState.user.firstName} ${authState.user.lastName}`)

      addNotification(`Invitation sent to ${email}`, `/admin?highlight=${invitation.id}`)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to create invitation. Please try again." }
    }
  }

  const getInvitations = (): Invitation[] => {
    return getStoredInvitations()
  }

  const revokeInvitation = async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user || authState.user.role !== "admin") {
        return { success: false, error: "Only administrators can revoke invitations" }
      }

      const invitations = getStoredInvitations()
      const invitation = invitations.find((inv) => inv.id === invitationId)

      if (!invitation) {
        return { success: false, error: "Invitation not found" }
      }

      if (invitation.used) {
        return { success: false, error: "Cannot revoke used invitation" }
      }

      // Mark as expired by setting expiry to past
      invitation.expiresAt = new Date(Date.now() - 1000).toISOString()
      saveInvitation(invitation)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to revoke invitation. Please try again." }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
        resendVerification,
        updateProfile,
        createInvitation,
        getInvitations,
        revokeInvitation,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
