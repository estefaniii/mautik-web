import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Rutas que requieren autenticación
/*
  El carrito NO pide sesión.

  Estaba en esta lista, así que tocar el ícono del carrito mandaba a la
  pantalla de login: por eso aparecía el login a cada rato. En cualquier
  tienda se junta como invitado y la sesión se pide recién al pagar. El
  carrito de invitado ya existía (`mautik_cart_temp`) y se fusiona solo al
  iniciar sesión, así que no se pierde nada.
*/
const protectedRoutes = [
  '/checkout',
  '/orders',
  '/profile',
]

// Rutas exclusivas de admin
const adminRoutes = ['/admin']

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route))

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdmin && (!token || !token.isAdmin)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}
