import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ message: `GET /api/v1/competitors/${id} - Not implemented yet` }, { status: 501 });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ message: `PUT /api/v1/competitors/${id} - Not implemented yet` }, { status: 501 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ message: `DELETE /api/v1/competitors/${id} - Not implemented yet` }, { status: 501 });
}
