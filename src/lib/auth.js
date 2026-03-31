import 'server-only'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function getAuthUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  return {
    userId,
    role: user?.publicMetadata?.role ?? 'user', // 'admin' | 'user'
    fullName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.emailAddresses?.[0]?.emailAddress || 'Unbekannt',
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
