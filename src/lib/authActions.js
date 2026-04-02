'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { getUserByUsername, createUser, deleteUser, updatePasswordHash } from './users'
import { getAuthUser } from './auth'

function getJwtSecret() {
     return new TextEncoder().encode(process.env.JWT_SECRET)
}

export async function loginAction(prevState, formData) {
     const username = formData.get('username')?.toString().trim()
     const password = formData.get('password')?.toString()

     if (!username || !password) {
          return { error: 'Benutzername und Passwort sind Pflichtfelder.' }
     }

     const user = await getUserByUsername(username)
     if (!user) {
          return { error: 'Ungültige Anmeldedaten.' }
     }

     const valid = await bcrypt.compare(password, user.password_hash)
     if (!valid) {
          return { error: 'Ungültige Anmeldedaten.' }
     }

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
     if (authUser?.role !== 'admin') return { error: 'Keine Berechtigung.' }

     const username = formData.get('username')?.toString().trim()
     const password = formData.get('password')?.toString()
     const role = formData.get('role')?.toString() ?? 'user'

     if (!username || !password) {
          return { error: 'Benutzername und Passwort sind Pflichtfelder.' }
     }
     if (password.length < 8) {
          return { error: 'Passwort muss mindestens 8 Zeichen lang sein.' }
     }

     try {
          const passwordHash = await bcrypt.hash(password, 12)
          await createUser({ username, passwordHash, role })
          revalidatePath('/options')
          return { success: true }
     } catch (e) {
          if (e.message?.includes('unique') || e.code === '23505') {
               return { error: 'Benutzername bereits vergeben.' }
          }
          return { error: 'Fehler beim Erstellen des Benutzers.' }
     }
}

export async function changePasswordAction(prevState, formData) {
     const authUser = await getAuthUser()
     if (!authUser) return { error: 'Nicht angemeldet.' }

     const currentPassword = formData.get('currentPassword')?.toString()
     const newPassword = formData.get('newPassword')?.toString()
     const confirmPassword = formData.get('confirmPassword')?.toString()

     if (!currentPassword || !newPassword || !confirmPassword) {
          return { error: 'Alle Felder sind Pflichtfelder.' }
     }
     if (newPassword.length < 8) {
          return { error: 'Neues Passwort muss mindestens 8 Zeichen lang sein.' }
     }
     if (newPassword !== confirmPassword) {
          return { error: 'Passwörter stimmen nicht überein.' }
     }

     const user = await getUserByUsername(authUser.username)
     if (!user) return { error: 'Benutzer nicht gefunden.' }

     const valid = await bcrypt.compare(currentPassword, user.password_hash)
     if (!valid) return { error: 'Aktuelles Passwort ist falsch.' }

     const passwordHash = await bcrypt.hash(newPassword, 12)
     await updatePasswordHash(authUser.userId, passwordHash)
     return { success: true }
}

export async function deleteUserAction(id) {
     const authUser = await getAuthUser()
     if (authUser?.role !== 'admin') return { error: 'Keine Berechtigung.' }
     await deleteUser(id)
     revalidatePath('/options')
}
