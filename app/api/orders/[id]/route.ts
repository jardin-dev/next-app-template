import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - Mettre à jour partiellement une commande (Admin uniquement)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await request.json();
    const { isPickedUp, status } = body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        isPickedUp: isPickedUp !== undefined ? isPickedUp : undefined,
        status: status || undefined,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
