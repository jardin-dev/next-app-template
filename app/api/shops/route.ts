import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer toutes les boutiques
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    const isAdmin = payload?.role === 'ADMIN';

    const shops = await prisma.shop.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(shops);
  } catch (error) {
    console.error('Get shops error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une boutique (Admin)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token || '');

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, imageUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    const shop = await prisma.shop.create({
      data: { name, description, imageUrl },
    });

    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    console.error('Create shop error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
