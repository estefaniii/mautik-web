import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET /api/coupons — admin only
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Map id to _id for compatibility with the admin UI
  return NextResponse.json(coupons.map(c => ({ ...c, _id: c.id })))
}

// POST /api/coupons — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { code, type, value, minPurchase, maxDiscount, usageLimit, validFrom, validUntil, isActive, applicableCategories, applicableProducts, description } = body

  if (!code || !type || value == null || !usageLimit || !validFrom) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (existing) {
    return NextResponse.json({ error: 'Ya existe un cupón con ese código' }, { status: 409 })
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      type,
      value,
      minPurchase: minPurchase || null,
      maxDiscount: maxDiscount || null,
      usageLimit,
      validFrom: new Date(validFrom),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: isActive ?? true,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      description: description || null,
    },
  })

  return NextResponse.json({ ...coupon, _id: coupon.id }, { status: 201 })
}
