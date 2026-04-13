'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { getUserByUsername, createUser, deleteUser, updatePasswordHash } from './users'
import { getAuthUser } from './auth'
import { getTranslations } from 'next-intl/server'

function getJwtSecret() {
     return new TextEncoder().encode(process.env.JWT_SECRET)
}

export async function loginAction(prevState, formData) {
     const username = formData.get('username')?.toString().trim()
     const password = formData.get('password')?.toString()
     const t = await getTranslations('error')

     if (!username || !password) return { error: t('authRequired') }

     const user = await getUserByUsername(username)
     if (!user) return { error: t('invalidCredentials') }

     const valid = await bcrypt.compare(password, user.password_hash)
     if (!valid) return { error: t('invalidCredentials') }

     const token = await new SignJWT({ userId: String(user.id), username: user.username, role: user.role })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('7d')
          .sign(getJwtSecret())

     const cookieStore = await cookies()
     cookieStore.set('session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
     })

     redirect('/dashboard')
}

export async function logoutAction() {
     const cookieStore = await cookies()
     cookieStore.set('session', '', { maxAge: 0, path: '/' })
     redirect('/sign-in')
}

export async function createUserAction(prevState, formData) {
     const authUser = await getAuthUser()
     const t = await getTranslations('error')

     if (authUser?.role !== 'admin') return { error: t('noPermission') }

     const username = formData.get('username')?.toString().trim()
     const password = formData.get('password')?.toString()
     const role = formData.get('role')?.toString() ?? 'user'

     if (!username || !password) return { error: t('authRequired') }
     if (password.length < 8) return { error: t('passwordMin8') }

     try {
          const passwordHash = await bcrypt.hash(password, 12)
          await createUser({ username, passwordHash, role })
          revalidatePath('/options')
          return { success: true }
     } catch (e) {
          if (e.message?.includes('unique') || e.code === '23505') return { error: t('usernameTaken') }
          return { error: t('createUserFailed') }
     }
}

export async function changePasswordAction(prevState, formData) {
     const authUser = await getAuthUser()
     const t = await getTranslations('error')

     if (!authUser) return { error: t('notLoggedIn') }

     const currentPassword = formData.get('currentPassword')?.toString()
     const newPassword = formData.get('newPassword')?.toString()
     const confirmPassword = formData.get('confirmPassword')?.toString()

     if (!currentPassword || !newPassword || !confirmPassword) return { error: t('allRequired') }
     if (newPassword.length < 8) return { error: t('newPasswordMin8') }
     if (newPassword !== confirmPassword) return { error: t('passwordMismatch') }

     const user = await getUserByUsername(authUser.username)
     if (!user) return { error: t('userNotFound') }

     const valid = await bcrypt.compare(currentPassword, user.password_hash)
     if (!valid) return { error: t('wrongPassword') }

     const passwordHash = await bcrypt.hash(newPassword, 12)
     await updatePasswordHash(authUser.userId, passwordHash)
     return { success: true }
}

export async function deleteUserAction(id) {
     const authUser = await getAuthUser()
     const t = await getTranslations('error')
     if (authUser?.role !== 'admin') return { error: t('noPermission') }
     await deleteUser(id)
     revalidatePath('/options')
}
