/**
 * Merch API Routes
 *
 * GET  /api/merch?creatorId=xxx  — List merch for a creator
 *   Calls Printora BE: GET /api/v1/creators/:creatorId/merch
 *   Falls back to local store if BE unavailable
 *
 * POST /api/merch                — Create new merch
 *   Calls Printora BE: POST /api/v1/creators/:creatorId/merch
 *   Uses BE response ID for local store
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  getAllMerchByCreator,
  getMerchById,
  createMerch,
  type StoredMerch,
} from "@/lib/merch-store";
import { createCreatorMerch, PrintoraApiError } from "@/lib/printora-client";

const createMerchSchema = z.object({
  creatorId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  imageUrl: z.string().default(""),
  productName: z.string().min(1),
  category: z.string().min(1),
  productId: z.string().uuid(),
  variantIds: z.array(z.string()).min(1),
  stockLimit: z.number().nullable().optional(),
  variants: z.array(
    z.object({
      id: z.string(),
      color: z.string(),
      colorCode: z.string().nullable(),
      size: z.string(),
      price: z.number(),
    })
  ).min(1, "At least one variant is required"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get("creatorId");

  if (!creatorId) {
    return NextResponse.json(
      { error: "creatorId query parameter is required" },
      { status: 400 }
    );
  }

  // Fetch from Printora BE: GET /api/v1/creators/:creatorId/merch
  try {
    const url = `${env.PRINTORA_API_URL}/api/v1/creators/${creatorId}/merch`;
    console.log(`[Merch API] GET ${url}`);

    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${env.PRINTORA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (res.ok) {
      // Response: { success: true, data: { merch: [...] } }
      const items = json.data?.merch ?? json.data ?? json.merch ?? [];
      console.log(`[Merch API] Fetched ${items.length} merch from Printora for creator ${creatorId}`);

      // Map BE response to local format and sync to store
      const mappedItems: StoredMerch[] = items.map((item: Record<string, unknown>) => {
        const variants = (item.variants as Record<string, unknown>[] ?? []).map((v: Record<string, unknown>) => ({
          id: v.id as string,
          color: v.color as string,
          colorCode: (() => { const c = (v.colorCode ?? v.color_code ?? null) as string | null; return c && !c.startsWith("#") ? `#${c}` : c; })(),
          size: v.size as string,
          price: (v.endPrice ?? v.end_price ?? 0) as number,
        }));

        const product = item.product as Record<string, unknown> | undefined;

        const merch: StoredMerch = {
          id: item.id as string,
          creatorId,
          title: item.title as string,
          description: (item.description ?? "") as string,
          imageUrl: (item.designImageUrl ?? "") as string,
          productName: (product?.name ?? "") as string,
          category: (product?.category ?? "") as string,
          active: item.status === "active",
          variants,
          stockLimit: (item.stockLimit ?? null) as number | null,
          stockSold: (item.stockSold ?? 0) as number,
          stockRemaining: (item.stockRemaining ?? null) as number | null,
          isLimitedEdition: (item.isLimitedEdition ?? false) as boolean,
          createdAt: (item.createdAt ?? "") as string,
          updatedAt: (item.updatedAt ?? item.createdAt ?? "") as string,
        };

        // Sync to local store
        if (!getMerchById(merch.id)) {
          createMerch(merch);
        }

        return merch;
      });

      return NextResponse.json({ data: mappedItems });
    }
  } catch (err) {
    console.error(`[Merch API] Failed to fetch from Printora:`, err);
  }

  // Fallback: local store
  const items = getAllMerchByCreator(creatorId);
  return NextResponse.json({ data: items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createMerchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      creatorId,
      title,
      description,
      imageUrl,
      productName,
      category,
      productId,
      variantIds,
      stockLimit,
      variants,
    } = result.data;

    // Call Printora BE: POST /api/v1/creators/:creatorId/merch
    let merchId: string;
    let editSession: { sessionId: string; token: string; editorUrl: string; expiresAt: string } | null = null;

    try {
      const printoraResult = await createCreatorMerch(creatorId, {
        title,
        description: description || undefined,
        productId,
        variantIds,
        designImageUrl: imageUrl,
        stockLimit: stockLimit ?? undefined,
      });

      merchId = printoraResult.id;
      editSession = printoraResult.editSession ?? null;
      console.log(`[Merch API] Printora created merch "${title}" (${merchId}) for creator ${creatorId}`);
    } catch (apiError) {
      if (apiError instanceof PrintoraApiError) {
        console.error(`[Merch API] Printora API error: ${apiError.status} ${apiError.message}`);
        return NextResponse.json(
          { error: `Printora: ${apiError.message}`, code: apiError.code, details: apiError.details },
          { status: apiError.status }
        );
      }
      return NextResponse.json({ error: "Failed to create merch on Printora" }, { status: 502 });
    }

    // Store locally with BE's ID
    const now = new Date().toISOString();
    const merch: StoredMerch = {
      id: merchId,
      creatorId,
      title,
      description,
      imageUrl,
      productName,
      category,
      active: true,
      variants,
      stockLimit: stockLimit ?? null,
      stockSold: 0,
      stockRemaining: stockLimit ?? null,
      isLimitedEdition: stockLimit != null,
      createdAt: now,
      updatedAt: now,
    };

    const created = createMerch(merch);
    console.log(`[Merch API] Stored merch "${created.title}" (${created.id})`);

    return NextResponse.json({ data: created, editSession }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
