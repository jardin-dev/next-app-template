import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Statistiques globales
    const usersCount = await prisma.user.count({ where: { role: 'CLIENT' } });
    const productsCount = await prisma.product.count();
    const ordersCount = await prisma.order.count();

    const totalSales = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    });

    // Commandes récentes
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    // Top produits (par quantité vendue)
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProductsDetails = await Promise.all(
      topProducts.map(async (p) => {
        const product = await prisma.product.findUnique({
          where: { id: p.productId },
          include: { category: true },
        });
        return {
          name: product?.name || 'Inconnu',
          category: product?.category?.name || 'Autres',
          totalQuantity: p._sum.quantity,
        };
      })
    );

    return NextResponse.json({
      stats: {
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
        revenue: totalSales._sum.totalAmount || 0,
      },
      recentOrders,
      topProducts: topProductsDetails,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
