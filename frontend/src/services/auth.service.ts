import { apiRequest } from '@/services/api-client'
import type { AuthData, User } from '@/types/api'

export interface SignupPayload {
  username: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  signup(payload: SignupPayload) {
    return apiRequest<AuthData>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  login(payload: LoginPayload) {
    return apiRequest<AuthData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getMe() {
    return apiRequest<User>('/api/auth/me')
  },
}
