import { NextResponse } from 'next/server';

export function successResponse(data: any, status: number = 200, meta: any = null) {
  return NextResponse.json({
    success: true,
    data,
    meta,
    error: null
  }, { status });
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    data: null,
    meta: null,
    error: { message }
  }, { status });
}

export async function parseRequestBody(req: Request) {
  try {
    const text = await req.text();
    if (!text || text.trim() === '') {
      throw new Error("Request body is empty.");
    }
    return JSON.parse(text);
  } catch (error: any) {
    if (error.message === "Request body is empty.") {
      throw error;
    }
    throw new Error("Invalid or malformed JSON body.");
  }
}
