import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper pour vérifier si l'utilisateur est Admin
async function checkAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;

  return payload;
}

// PUT - Mettre à jour un produit
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      categoryName,
      price,
      priceUnit,
      imageUrl,
      isAvailable,
      stock,
      shopId,
      options,
    } = body;

    let categoryId = undefined;
    if (categoryName) {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryId = category.id;
    }

    // Si des options sont fournies, on purge les anciennes et on crée les nouvelles
    // C'est la stratégie la plus simple pour gérer les modifications imbriquées complexes
    if (options) {
      await prisma.productOption.deleteMany({
        where: { productId: id },
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(priceUnit !== undefined && { priceUnit }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(stock !== undefined && { stock: stock ? parseInt(stock) : null }),
        ...(shopId !== undefined && { shopId }),
        ...(options && {
          options: {
            create: options.map((opt: any) => ({
              name: opt.name,
              isRequired: opt.isRequired || false,
              values: {
                create: opt.values.map((val: any) => ({
                  name: val.name,
                  priceModifier: parseFloat(val.priceModifier) || 0,
                  priceMultiplier: parseFloat(val.priceMultiplier) || 1,
                })),
              },
            })),
          },
        }),
      },
      include: {
        category: true,
        shop: true,
        options: {
          include: { values: true },
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;

    // Vérifier si le produit est lié à des commandes
    const count = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (count > 0) {
      // Si lié à des commandes, on préfère le désactiver plutôt que de le supprimer
      // pour préserver l'historique
      await prisma.product.update({
        where: { id },
        data: { isAvailable: false },
      });
      return NextResponse.json({
        message: 'Produit désactivé car il possède un historique de commandes',
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Produit supprimé' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
