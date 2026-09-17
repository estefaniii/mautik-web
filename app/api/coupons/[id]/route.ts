import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// PUT /api/coupons/[id] — admin only
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { code, type, value, minPurchase, maxDiscount, usageLimit, validFrom, validUntil, isActive, applicableCategories, applicableProducts, description } = body

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      code: code.toUpperCase(),
      type,
      value,
      minPurchase: minPurchase || null,
      maxDiscount: maxDiscount || null,
      usageLimit,
      validFrom: new Date(validFrom),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      description: description || null,
    },
  })

  return NextResponse.json({ ...coupon, _id: coupon.id })
}

// DELETE /api/coupons/[id] — admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ message: 'Cupón eliminado' })
}
