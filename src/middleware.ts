import { NextResponse } from 'next/server'

import type { NextApiRequest } from 'next'

import { getToken } from 'next-auth/jwt'

import { CONST } from '@/constants/index.const'

import { utils } from './utils/utils'

const unprotectedRoutes = ['/login', '/register', '/forgot-password']
const protectedRoutes: string[] = ['admin/settings']

const adminRoutes: string[] = [
  '/admin',
  '/admin/categories',
  '/admin/creators',
  '/admin/users/creators',
  '/admin/users/app-users',
  '/admin/movies',
  'admin/settings'
]

const normalRoutes: string[] = []
const creatorRoutes: string[] = ['/', '/unapproved', '/movies/create', '/movies']

export async function middleware(req: NextApiRequest) {
  const data = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET })

  let baseUrl = ''
  let approved = true
  let redirectUrl = ''
  let requestHeaders = null
  let authenticatedUserRedirectUrl = ''
  let unAuthenticatedUserRedirectUrl = ''
  const isLoggedInUser = data && Object.keys(data).length > 0
  let publicUrl: string | boolean | null | undefined = null
  let protectedUrl: string | boolean | null | undefined = null
  let unprotectedUrl: string | boolean | null | undefined = null
  const semiUnProtectedUrl: string | boolean | null | undefined = null
  let creatorUrl: string | boolean | null | undefined = null
  let adminUrl: string | boolean | null | undefined = null

  switch (process.env.NEXT_PUBLIC_ENVIRONMENT) {
    case 'local':
      baseUrl = process.env.NEXT_PUBLIC_BASE_WEB_LOCAL_URL ?? 'http://localhost:3000/'
      authenticatedUserRedirectUrl = baseUrl
      unAuthenticatedUserRedirectUrl = `${baseUrl}login`
      break

    case 'dev':
      baseUrl = process.env.NEXT_PUBLIC_BASE_WEB_DEV_URL ?? 'https://projects.blupalms.com:5000/'
      authenticatedUserRedirectUrl = baseUrl
      unAuthenticatedUserRedirectUrl = `${baseUrl}login`
      break

    case 'prod':
      baseUrl = process.env.NEXT_PUBLIC_BASE_WEB_DEV_URL ?? 'https://projects.blupalms.com:5000/'
      authenticatedUserRedirectUrl = baseUrl
      unAuthenticatedUserRedirectUrl = `${baseUrl}login`
      break
  }

  redirectUrl = isLoggedInUser ? authenticatedUserRedirectUrl : unAuthenticatedUserRedirectUrl

  if (isLoggedInUser && data && data.type === utils.CONST.USER.TYPES.CREATOR) {
    approved = !!(data?.approved ?? false)
  }

  const pathname = decodeURIComponent((req as any)?.nextUrl?.pathname)

  requestHeaders = new Headers((req as any).headers)
  requestHeaders.set('x-pathname', pathname)
  requestHeaders.set('x-game', pathname)

  unprotectedUrl =
    unprotectedRoutes.find(cup => {
      return pathname.includes(cup)
    }) ?? null

  publicUrl =
    normalRoutes.find(cup => {
      return pathname.includes(cup)
    }) ?? null

  if (!unprotectedUrl) {
    protectedUrl = protectedRoutes.find(cup => pathname === cup) ?? null

    if (!protectedUrl) {
      creatorUrl = creatorRoutes.find(cup => pathname === cup) ?? null

      if (!creatorUrl) {
        adminUrl = adminRoutes.find(cup => pathname === cup) ?? null
      }
    }
  }

  const isCreator = data?.type === CONST.USER.TYPES.CREATOR
  const isAdmin = data?.type === CONST.USER.TYPES.ADMIN

  if (0) {
    console.log({
      pathname,
      creatorUrl,
      adminUrl,
      publicUrl,
      protectedUrl,
      isLoggedInUser,
      semiUnProtectedUrl,
      unprotectedUrl,
      data,
      baseUrl,
      isCreator,
      isAdmin
    })
  }

  if (protectedUrl || unprotectedUrl || publicUrl || creatorUrl || adminUrl || !approved) {
    if (isLoggedInUser && isCreator && unprotectedUrl) {
      redirectUrl = `${baseUrl}`
      console.debug(`redirected to: ${redirectUrl}, when user is logged in and is unprotected url`)

      return NextResponse.redirect(redirectUrl)
    } else if (isLoggedInUser && isAdmin && (unprotectedUrl || !adminUrl)) {
      redirectUrl = `${baseUrl}admin`
      console.debug(`redirected to: ${redirectUrl}, when user is logged in and is unprotected url`)

      return NextResponse.redirect(redirectUrl)
    } else if (!isLoggedInUser && (adminUrl || creatorUrl || protectedUrl)) {
      console.debug(`redirected to: ${redirectUrl}, when user isn't logged in, and is protected url`)

      return NextResponse.redirect(redirectUrl)
    } else if (isLoggedInUser && isCreator && creatorUrl) {
      if (!approved && creatorUrl !== '/unapproved') {
        redirectUrl = `${baseUrl}unapproved`
        console.debug(`redirected to: ${redirectUrl}, when user is logged in and but profile isn't approved`)

        return NextResponse.redirect(redirectUrl)
      }
    } else if (protectedUrl && !isCreator) {
      redirectUrl = `${baseUrl}`
      console.debug(`redirected to: ${redirectUrl}, when user isn't developer, and is protected url`)

      return NextResponse.redirect(redirectUrl)
    } else if (creatorUrl && !isCreator) {
      redirectUrl = `${baseUrl}`
      console.debug(`redirected to: ${redirectUrl}, when user isn't creator, and is creator url`)

      return NextResponse.redirect(redirectUrl)
    } else if (adminUrl && !isAdmin) {
      redirectUrl = `${baseUrl}`
      console.debug(`redirected to: ${redirectUrl}, when user isn't admin, and is admin url`)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next(
    requestHeaders
      ? {
        request: {
          headers: requestHeaders
        }
      }
      : {}
  )
}
