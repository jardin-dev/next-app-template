import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Mettre à jour une boutique
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token || '');

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, imageUrl, isActive } = body;

    const shop = await prisma.shop.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Update shop error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une boutique
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token || '');

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;

    // Vérifier si la boutique a des produits
    const productsCount = await prisma.product.count({
      where: { shopId: id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une boutique qui contient des produits' },
        { status: 400 }
      );
    }

    await prisma.shop.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Boutique supprimée' });
  } catch (error) {
    console.error('Delete shop error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
