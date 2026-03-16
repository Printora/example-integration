/**
 * Catalog API Route
 *
 * GET /api/catalog — Proxy to Printora: GET /api/v1/catalog/products
 * Returns products with real productId and variantIds from Printora BE
 */

import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  if (searchParams.get("limit")) params.set("limit", searchParams.get("limit")!);
  if (searchParams.get("offset")) params.set("offset", searchParams.get("offset")!);
  if (searchParams.get("category")) params.set("category", searchParams.get("category")!);
  if (searchParams.get("search")) params.set("search", searchParams.get("search")!);

  try {
    const url = `${env.PRINTORA_API_URL}/api/v1/catalog/products?${params}`;
    console.log(`[Catalog API] GET ${url}`);

    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${env.PRINTORA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch catalog" },
        { status: res.status }
      );
    }

    // Response per docs: { success: true, products: [...], total, limit, offset }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to Printora API" },
      { status: 502 }
    );
  }
}
