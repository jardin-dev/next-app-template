import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        shop: true,
        category: true,
        options: {
          include: {
            values: true,
          },
        },
      },
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau produit (Admin uniquement)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token || '');

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, categoryName, price, priceUnit, imageUrl, stock, shopId, options } =
      body;

    if (!name || !categoryName || price === undefined) {
      return NextResponse.json({ error: 'Nom, catégorie et prix requis' }, { status: 400 });
    }

    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        categoryId: category.id,
        price: parseFloat(price),
        priceUnit: priceUnit || 'unitaire',
        imageUrl: imageUrl || null,
        stock: stock ? parseInt(stock) : null,
        shopId: shopId || null,
        options: {
          create: options?.map((opt: any) => ({
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
      },
      include: {
        category: true,
        shop: true,
        options: {
          include: { values: true },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
