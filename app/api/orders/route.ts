import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { calculateDeliveryDate } from '@/lib/delivery-cycles';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les commandes
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    let orders;

    if (payload.role === 'ADMIN') {
      // Admin : récupérer toutes les commandes
      const { searchParams } = new URL(request.url);
      const deliveryDate = searchParams.get('deliveryDate');

      orders = await prisma.order.findMany({
        where: deliveryDate
          ? {
              deliveryDate: {
                gte: new Date(deliveryDate),
                lt: new Date(new Date(deliveryDate).getTime() + 24 * 60 * 60 * 1000),
              },
            }
          : undefined,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          orderItems: {
            include: {
              product: {
                include: {
                  shop: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Client : récupérer uniquement ses commandes
      orders = await prisma.order.findMany({
        where: { userId: payload.userId },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle commande
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { deliveryCycle, deliveryDate, items, notes } = body;

    // Validation
    if (!deliveryCycle || !items || items.length === 0) {
      return NextResponse.json({ error: 'Cycle de livraison et articles requis' }, { status: 400 });
    }

    // Calculer le montant total
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isAvailable) {
        return NextResponse.json(
          { error: `Produit ${item.productId} non disponible` },
          { status: 400 }
        );
      }

      // Utiliser le unitPrice passé par le front (qui inclut les options)
      // ou le prix du produit par défaut
      const unitPrice = item.unitPrice || product.price;
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        subtotal,
        notes: item.notes || null,
      });
    }

    // Générer un numéro de commande unique
    const orderNumber = `CMD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Créer la commande avec les articles
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: payload.userId,
        deliveryCycle,
        deliveryDate: new Date(deliveryDate),
        totalAmount,
        notes: notes || null,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
