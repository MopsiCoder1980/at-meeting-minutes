import 'server-only'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

function getJwtSecret() {
     const secret = process.env.JWT_SECRET
     if (!secret) throw new Error('JWT_SECRET is not set')
     return new TextEncoder().encode(secret)
}

export async function getAuthUser() {
     const cookieStore = await cookies()
     const token = cookieStore.get('session')?.value
     if (!token) return null

     try {
          const { payload } = await jwtVerify(token, getJwtSecret())
          return {
               userId: String(payload.userId),
               username: payload.username,
               role: payload.role ?? 'user',
               fullName: payload.username,
          }
     } catch {
          return null
     }
}

export function canEdit(authUser, minute) {
     if (!authUser) return false
     if (authUser.role === 'admin') return true
     return minute.ownerId === authUser.userId
}

export function canDelete(authUser, minute) {
     return canEdit(authUser, minute)
}

export function canView(authUser, minute) {
     if (!authUser) return false
     if (authUser.role === 'admin') return true
     if (minute.ownerId === authUser.userId) return true
     if (minute.visibility === 'shared') return true
     return false
}
