import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "GET /api/v1/features - Not implemented yet" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "POST /api/v1/features - Not implemented yet" }, { status: 501 });
}
