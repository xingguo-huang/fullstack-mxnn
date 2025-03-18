import { NextRequest } from 'next/server';
import { products } from '@/app/product-data';
import { connectToDb } from '@/app/api/db';

type ShoppingCart = Record<string, string[]>;

const carts: ShoppingCart = {
  '1': ['123', '234'],
  '2': ['345', '456'],
  '3': ['234'],
}

type Params = {
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { db } = await connectToDb();

  const userId = params.id;
  const userCart = await db.collection('carts').findOne({ userId });

  if (!userCart) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  const cartIds = userCart.cartIds;
  const cartProducts = await db.collection('products').find({ id: { $in: cartIds } }).toArray();

  return new Response(JSON.stringify(cartProducts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

type CartBody = {
  productId: string;
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { db } = await connectToDb();

  const userId = params.id;
  const body: CartBody = await request.json();
  const productId = body.productId;

  const updatedCart = await db.collection('carts').findOneAndUpdate(
    { userId },
    { $push: { cartIds: productId } },
    { upsert: true, returnDocument: 'after' },
  )

  const cartProducts = await db.collection('products').find({ id: { $in: updatedCart.cartIds } }).toArray()

  return new Response(JSON.stringify(cartProducts), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const userId = params.id;
  const body = await request.json();
  const productId = body.productId;

  carts[userId] = carts[userId] ? carts[userId].filter(pid => pid !== productId) : [];
  const cartProducts = carts[userId].map(id => products.find(p => p.id === id));

  return new Response(JSON.stringify(cartProducts), {
    status: 202,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}