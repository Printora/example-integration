/**
 * Single Merch API Routes
 *
 * GET   /api/merch/[id]?creatorId=xxx  — Get merch detail from Printora BE
 *   Calls: GET /api/v1/creators/:creatorId/merch/:merchId
 *
 * PUT   /api/merch/[id]  — Update merch
 *   Calls: PUT /api/v1/creators/:creatorId/merch/:merchId
 *
 * PATCH /api/merch/[id]  — Toggle active status
 *   Calls: PUT /api/v1/creators/:creatorId/merch/:merchId { status, isActive }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getMerchById, updateMerch, setMerchActive, createMerch, type StoredMerch } from "@/lib/merch-store";
import { updateCreatorMerch, PrintoraApiError } from "@/lib/printora-client";

const updateMerchSchema = z.object({
  creatorId: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  productName: z.string().optional(),
  category: z.string().optional(),
  variantIds: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        id: z.string(),
        color: z.string(),
        colorCode: z.string().nullable(),
        size: z.string(),
        price: z.number(),
      })
    )
    .min(1)
    .optional(),
});

const patchSchema = z.object({
  creatorId: z.string().min(1).optional(),
  active: z.boolean(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: merchId } = await params;
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json({ error: "creatorId query parameter is required" }, { status: 400 });
    }

    // Fetch from Printora BE: GET /api/v1/creators/:creatorId/merch/:merchId
    const url = `${env.PRINTORA_API_URL}/api/v1/creators/${creatorId}/merch/${merchId}`;
    console.log(`[Merch API] GET ${url}`);

    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${env.PRINTORA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (res.ok) {
      const item = json.data ?? json.merch ?? json;
      return NextResponse.json({ data: item });
    }

    // Fallback: local store
    const local = getMerchById(merchId);
    if (local) {
      return NextResponse.json({ data: local });
    }

    return NextResponse.json({ error: "Merch not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: merchId } = await params;

    const body = await request.json();
    const result = updateMerchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { creatorId, variants, variantIds, imageUrl, productName, category, ...localUpdates } = result.data;

    // 1. Call Printora API first: PUT /api/v1/creators/:creatorId/merch/:merchId
    let printoraSuccess = false;
    try {
      await updateCreatorMerch(creatorId, merchId, {
        ...(localUpdates.title && { title: localUpdates.title }),
        ...(localUpdates.description !== undefined && { description: localUpdates.description }),
        ...(imageUrl !== undefined && { designImageUrl: imageUrl }),
        ...(variantIds && { variantIds }),
      });
      printoraSuccess = true;
      console.log(`[Merch API] Printora updated merch (${merchId}) for creator (${creatorId})`);
    } catch (apiError) {
      if (apiError instanceof PrintoraApiError) {
        console.error(`[Merch API] Printora API error: ${apiError.status} ${apiError.message}`);
      }
    }

    // 2. Update or create in local store
    const storeUpdates = {
      ...localUpdates,
      ...(imageUrl !== undefined && { imageUrl }),
      ...(variants && { variants }),
    };

    let localData: StoredMerch | null = null;
    const existing = getMerchById(merchId);

    if (existing) {
      localData = updateMerch(merchId, storeUpdates);
    } else {
      // Item not in store (hot-reload cleared it) — re-create
      const now = new Date().toISOString();
      localData = createMerch({
        id: merchId,
        creatorId,
        title: localUpdates.title ?? "Untitled",
        description: localUpdates.description ?? "",
        imageUrl: imageUrl ?? "",
        productName: productName ?? "",
        category: category ?? "",
        active: true,
        variants: variants ?? [],
        stockLimit: null,
        stockSold: 0,
        stockRemaining: null,
        isLimitedEdition: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(`[Merch API] Updated merch "${localData?.title}" (${merchId})`);

    return NextResponse.json({
      data: localData,
      ...(printoraSuccess ? {} : { warning: "Printora API unreachable, updated locally." }),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: merchId } = await params;

    const body = await request.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { active, creatorId } = result.data;
    const existing = getMerchById(merchId);
    const cid = creatorId ?? existing?.creatorId;

    if (!cid) {
      return NextResponse.json({ error: "creatorId is required" }, { status: 400 });
    }

    // Call Printora API to update status
    try {
      const status = active ? "active" : "inactive";
      await updateCreatorMerch(cid, merchId, { status, isActive: active });
      console.log(`[Merch API] Printora status updated merch (${merchId}) → ${status}`);
    } catch (apiError) {
      if (apiError instanceof PrintoraApiError) {
        console.error(`[Merch API] Printora API error: ${apiError.status} ${apiError.message}`);
      }
    }

    // Update local store
    let localData: StoredMerch | null = null;
    if (existing) {
      localData = setMerchActive(merchId, active);
    } else {
      // Not in store — just return the toggled state
      localData = { id: merchId, creatorId: cid, title: "", description: "", imageUrl: "", productName: "", category: "", active, variants: [], stockLimit: null, stockSold: 0, stockRemaining: null, isLimitedEdition: false, createdAt: "", updatedAt: "" };
    }

    console.log(`[Merch API] ${active ? "Activated" : "Deactivated"} merch (${merchId})`);

    return NextResponse.json({ data: localData });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
