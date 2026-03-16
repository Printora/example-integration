"use client";

import { useState, useRef, useEffect } from "react";
import {
  Heart,
  Share2,
  X,
  Search,
  Sparkles,
  Eye,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Zap,
  TrendingUp,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
  Store,
  ShoppingBag,
  Check,
  User,
  Palette,
} from "lucide-react";
import Link from "next/link";
import type { Creator, MerchVariant, MerchInfo, GalleryImage, PrintStep } from "./data";
import { CREATORS, MERCH_CATALOG, GALLERY_IMAGES, CATEGORIES, DEMO_USER, getMerch } from "./data";

// Data imported from ./data

const HEIGHT_CLASSES: Record<GalleryImage["height"], string> = {
  short: "h-48 sm:h-56",
  medium: "h-56 sm:h-72",
  tall: "h-72 sm:h-88",
  xtall: "h-80 sm:h-[26rem]",
};

// ============ Helpers ============

function getCreator(creatorId: string): Creator {
  return CREATORS[creatorId] ?? {
    id: creatorId,
    name: "Unknown",
    slug: "unknown",
    avatar: "??",
    description: "",
    gradient: "from-zinc-500 to-zinc-600",
  };
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

// ============ Demo Banner ============

function DemoBanner() {
  return (
    <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-center">
      <p className="text-sm text-emerald-300">
        <span className="mr-2 inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          Partner Demo
        </span>
        This is a simulated AI platform showing Printora&apos;s partner integration.{" "}
        <span className="font-medium text-white">
          Click any image &rarr; &ldquo;Print on Product&rdquo;
        </span>{" "}
        to test the real flow.
      </p>
    </div>
  );
}

// ============ Header ============

function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white">
          JD
        </div>
        <div className="hidden text-left text-sm sm:block">
          <div className="font-medium text-white">{DEMO_USER.name}</div>
          <div className="text-xs text-zinc-500">{DEMO_USER.email}</div>
        </div>
        <ChevronDown className={`hidden h-3.5 w-3.5 text-zinc-500 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#14141f] shadow-2xl shadow-black/50">
          <div className="border-b border-white/5 px-4 py-3">
            <div className="text-sm font-medium text-white">{DEMO_USER.name}</div>
            <div className="text-xs text-zinc-500">{DEMO_USER.email}</div>
          </div>
          <div className="py-1">
            <button
              disabled
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-zinc-500 cursor-not-allowed"
              title="Demo only"
            >
              <User className="h-4 w-4" />
              My Profile
            </button>
            <Link
              href="/ai-image-app/creator-dashboard"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/5"
            >
              <Palette className="h-4 w-4 text-violet-400" />
              <span>Switch to Creator</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-zinc-500" />
            </Link>
            <button
              disabled
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-zinc-500 cursor-not-allowed"
              title="Demo only"
            >
              <Store className="h-4 w-4" />
              My Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a12]/90 backdrop-blur-xl">
      <DemoBanner />
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/ai-image-app" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Dream<span className="text-violet-400">Canvas</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {["Create", "Browse", "Models", "Community"].map((item) => (
            <button
              key={item}
              className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                item === "Browse"
                  ? "bg-white/10 text-white"
                  : "cursor-not-allowed text-zinc-600"
              }`}
              disabled={item !== "Browse"}
              title={item !== "Browse" ? "Demo only — not functional" : undefined}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden max-w-xs flex-1 px-6 lg:block">
          <div className="relative opacity-40">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search creations..."
              disabled
              className="w-full cursor-not-allowed rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Logged-in user profile with dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
}

// ============ Filter Bar ============

function FilterBar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (cat: string) => void;
}) {
  return (
    <div className="border-b border-white/5 bg-[#0a0a12]/60">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 overflow-x-auto px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const isAll = cat === "all";
            return (
              <button
                key={cat}
                onClick={isAll ? () => onSelect(cat) : undefined}
                disabled={!isAll}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-all ${
                  isAll
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                    : "cursor-not-allowed bg-white/5 text-zinc-600 opacity-40"
                }`}
                title={!isAll ? "Demo only" : undefined}
              >
                {cat === "trending" && (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                {cat === "all" && <Grid3X3 className="h-3.5 w-3.5" />}
                {cat}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 opacity-30">
          <button disabled className="flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-500" title="Demo only">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Aspect</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          <button disabled className="flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-500" title="Demo only">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Model</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Image Card ============

function ImageCard({
  image,
  onClick,
}: {
  image: GalleryImage;
  onClick: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const creator = getCreator(image.creatorId);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl break-inside-avoid mb-4"
      onClick={onClick}
    >
      {/* Image */}
      <div className={`relative ${HEIGHT_CLASSES[image.height]} w-full bg-zinc-900`}>
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-zinc-800/50" />
        )}
        <img
          ref={imgRef}
          src={image.url}
          alt={image.title}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top actions on hover */}
        <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
              liked
                ? "bg-red-500 text-white"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
            />
          </button>
        </div>

        {/* Bottom info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${creator.gradient} text-[10px] font-bold text-white`}>
                {creator.avatar}
              </div>
              <span className="text-sm font-medium text-white">
                @{creator.slug}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatNumber(image.likes)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatNumber(image.views)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Image Detail Modal ============

function ImageModal({
  image,
  onClose,
  onPrint,
}: {
  image: GalleryImage;
  onClose: () => void;
  onPrint: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const creator = getCreator(image.creatorId);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#12121a] shadow-2xl md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        <div className="relative flex-1 bg-black">
          <img
            src={image.url}
            alt={image.title}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Sidebar */}
        <div className="flex w-full flex-col border-t border-white/5 md:w-80 md:border-l md:border-t-0 lg:w-96">
          {/* Creator info */}
          <div className="border-b border-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${creator.gradient} text-sm font-bold text-white`}>
                {creator.avatar}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">
                  {creator.name}
                </div>
                <div className="text-xs text-zinc-500">@{creator.slug} &middot; {image.createdAt}</div>
              </div>
            </div>
            {creator.description && (
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                {creator.description}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto p-5">
            <h2 className="mb-3 text-lg font-bold text-white">
              {image.title}
            </h2>

            {/* Prompt */}
            <div className="mb-4">
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Prompt
              </div>
              <p className="rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-zinc-300">
                {image.prompt}
              </p>
            </div>

            {/* Model */}
            <div className="mb-5">
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Model
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-sm text-violet-300">
                <Sparkles className="h-3 w-3" />
                {image.model}
              </div>
            </div>

            {/* Stats */}
            <div className="mb-5 flex gap-4">
              <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Heart className="h-4 w-4" />
                {formatNumber(image.likes)}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Eye className="h-4 w-4" />
                {formatNumber(image.views)}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                <MessageCircle className="h-4 w-4" />
                {formatNumber(image.comments)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  liked
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
                />
                {liked ? "Liked" : "Like"}
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          {/* Print CTA */}
          <div className="border-t border-white/5 p-4">
            <button
              onClick={onPrint}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:shadow-xl hover:shadow-violet-600/30 animate-pulse"
            >
              <Store className="h-4 w-4" />
              Shop {creator.name}&apos;s Merch
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-zinc-500">
              <span className="rounded bg-white/5 px-1.5 py-0.5">T-Shirts</span>
              <span className="rounded bg-white/5 px-1.5 py-0.5">Hoodies</span>
              <span className="rounded bg-white/5 px-1.5 py-0.5">Mugs</span>
              <span className="rounded bg-white/5 px-1.5 py-0.5">Posters</span>
              <span className="rounded bg-white/5 px-1.5 py-0.5">Home Decor</span>
              <span className="text-zinc-600">+more</span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
              <span>Powered by</span>
              <span className="font-semibold text-zinc-400">Printora</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Print Modal (Flow C — Direct Merch Link) ============

// ============ 2-Step Variant Picker (Color → Size) ============

function VariantPicker({
  variants,
  selectedVariant,
  onSelect,
  onOrder,
  soldOut = false,
}: {
  variants: MerchVariant[];
  selectedVariant: MerchVariant | null;
  onSelect: (v: MerchVariant) => void;
  onOrder: () => void;
  soldOut?: boolean;
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Group variants by color, dedup by color+size
  const colorMap = new Map<string, { colorCode: string | null; variants: MerchVariant[] }>();
  const seen = new Set<string>();
  for (const v of variants) {
    const key = `${v.color}|${v.size}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!colorMap.has(v.color)) {
      colorMap.set(v.color, { colorCode: v.colorCode, variants: [] });
    }
    colorMap.get(v.color)!.variants.push(v);
  }
  const colors = [...colorMap.entries()];

  // Size variants for the selected color
  const sizeVariants = selectedColor ? (colorMap.get(selectedColor)?.variants ?? []) : [];

  // Price range for a color
  function colorPriceLabel(colorVariants: MerchVariant[]) {
    const min = Math.min(...colorVariants.map((v) => v.price));
    const max = Math.max(...colorVariants.map((v) => v.price));
    return min === max ? `$${min.toFixed(2)}` : `from $${min.toFixed(2)}`;
  }

  return (
    <div className="p-5 space-y-4">
      {/* Step 1: Color tags */}
      {!selectedColor && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Select Color ({colors.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map(([colorName, { colorCode, variants: colorVariants }]) => (
              <button
                key={colorName}
                onClick={() => {
                  setSelectedColor(colorName);
                  if (colorVariants.length === 1) {
                    onSelect(colorVariants[0]);
                  }
                }}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div
                  className="h-5 w-5 shrink-0 rounded-full border border-white/20"
                  style={{ backgroundColor: colorCode ?? "#666" }}
                />
                <span className="text-sm text-white">{colorName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Size tags for selected color */}
      {selectedColor && (
        <div>
          <button
            onClick={() => {
              setSelectedColor(null);
              onSelect(null as unknown as MerchVariant);
            }}
            className="mb-3 flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to colors
          </button>

          <div className="mb-3 flex items-center gap-2">
            <div
              className="h-5 w-5 rounded-full border border-white/20"
              style={{ backgroundColor: colorMap.get(selectedColor)?.colorCode ?? "#666" }}
            />
            <span className="text-sm font-medium text-white">{selectedColor}</span>
          </div>

          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Select Size
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeVariants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => onSelect(variant)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                    isSelected
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-medium text-white">{variant.size}</span>
                  <span className="text-xs text-zinc-400">${variant.price.toFixed(2)}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-violet-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* User info */}
      <div className="rounded-lg bg-white/5 p-3">
        <div className="text-xs text-zinc-500">
          Ordering as <span className="text-zinc-300">{DEMO_USER.name}</span> ({DEMO_USER.email})
        </div>
      </div>

      {/* Order button */}
      <button
        onClick={onOrder}
        disabled={!selectedVariant || soldOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:shadow-xl hover:shadow-violet-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ShoppingBag className="h-4 w-4" />
        {selectedVariant
          ? <>Order &mdash; ${selectedVariant.price.toFixed(2)} <ArrowRight className="h-4 w-4" /></>
          : "Select a variant"
        }
      </button>
    </div>
  );
}

// ============ Print Modal ============

function PrintModal({
  image,
  onClose,
}: {
  image: GalleryImage;
  onClose: () => void;
}) {
  const localMerch = getMerch(image.merchId);
  const creator = getCreator(image.creatorId);
  const [merch, setMerch] = useState<MerchInfo | null>(localMerch);
  const [selectedVariant, setSelectedVariant] = useState<MerchVariant | null>(
    localMerch?.variants[0] ?? null
  );
  const [step, setStep] = useState<PrintStep>("idle");
  const [error, setError] = useState("");
  const [loadingMerch, setLoadingMerch] = useState(true);
  const [stockInfo, setStockInfo] = useState<{
    stockLimit: number | null;
    stockSold: number;
    stockRemaining: number | null;
    isLimitedEdition: boolean;
  } | null>(null);

  // Fetch latest merch data from BE
  useEffect(() => {
    async function fetchMerch() {
      try {
        const res = await fetch(`/api/merch/${image.merchId}?creatorId=${image.creatorId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const beVariants = (json.data.variants ?? []).map((v: Record<string, unknown>) => ({
              id: v.id as string,
              color: v.color as string,
              colorCode: (() => { const c = (v.colorCode ?? v.color_code ?? null) as string | null; return c && !c.startsWith("#") ? `#${c}` : c; })(),
              size: v.size as string,
              price: (v.endPrice ?? v.end_price ?? v.price ?? 0) as number,
            }));
            const product = json.data.product as Record<string, unknown> | undefined;
            setMerch({
              id: json.data.id,
              title: json.data.title,
              description: json.data.description ?? "",
              imageUrl: json.data.designImageUrl ?? json.data.imageUrl ?? image.url,
              productName: (product?.name ?? json.data.productName ?? "") as string,
              category: (product?.category ?? json.data.category ?? "") as string,
              variants: beVariants.length > 0 ? beVariants : (localMerch?.variants ?? []),
            });
            if (beVariants.length > 0) {
              setSelectedVariant(beVariants[0]);
            }
            setStockInfo({
              stockLimit: json.data.stockLimit ?? null,
              stockSold: json.data.stockSold ?? 0,
              stockRemaining: json.data.stockRemaining ?? null,
              isLimitedEdition: json.data.isLimitedEdition ?? false,
            });
          }
        }
      } catch {
        // Keep local data as fallback
      } finally {
        setLoadingMerch(false);
      }
    }
    fetchMerch();
  }, [image.merchId, image.creatorId]);

  async function handleOrder() {
    setStep("loading");
    setError("");

    try {
      const res = await fetch("/api/printora/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchId: image.merchId,
          variantId: selectedVariant?.id,
          userData: DEMO_USER,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create session");
      }

      setStep("success");

      if (data.editorUrl) {
        window.open(data.editorUrl, "_blank");
      }
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#12121a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-zinc-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "idle" && loadingMerch && (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-400" />
            <p className="text-sm text-zinc-400">Loading merch details...</p>
          </div>
        )}

        {step === "idle" && !loadingMerch && merch && (
          <>
            {/* Product header with image */}
            <div className="flex gap-4 border-b border-white/5 p-5">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                <img src={image.url} alt={merch.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${creator.gradient} text-[9px] font-bold text-white`}>
                    {creator.avatar}
                  </div>
                  <span className="text-xs text-zinc-500">@{creator.slug}</span>
                </div>
                <h3 className="font-semibold text-white truncate">{merch.title}</h3>
                <p className="text-sm text-zinc-400">{merch.productName}</p>
                <p className="mt-1 text-xs text-zinc-500">{merch.description}</p>
              </div>
            </div>

            {/* Flow indicator */}
            <div className="border-b border-white/5 px-5 py-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-medium text-emerald-300">
                  Flow C
                </span>
                <span className="text-zinc-500">
                  Direct Merch &mdash; session with <code className="rounded bg-white/5 px-1 text-zinc-400">merchId</code>
                </span>
              </div>
            </div>

            {/* Stock info */}
            {stockInfo?.isLimitedEdition && (
              <div className="border-b border-white/5 px-5 py-2.5">
                {stockInfo.stockRemaining === 0 ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-medium text-red-300">
                      Sold Out
                    </span>
                    <span className="text-zinc-500">
                      {stockInfo.stockSold}/{stockInfo.stockLimit} sold
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-violet-500/20 px-1.5 py-0.5 font-medium text-violet-300">
                      Limited Edition
                    </span>
                    <span className="text-zinc-400">
                      {stockInfo.stockRemaining}/{stockInfo.stockLimit} remaining
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 2-step variant selector: Color → Size */}
            <VariantPicker
              variants={merch.variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
              onOrder={handleOrder}
              soldOut={stockInfo?.isLimitedEdition === true && stockInfo?.stockRemaining === 0}
            />
          </>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-400" />
            <p className="mb-1 text-sm font-medium text-zinc-300">
              Connecting to Printora...
            </p>
            <p className="text-xs text-zinc-500">
              Creating session for {merch?.title ?? "merch"}
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-6 w-6 text-emerald-400" />
            </div>
            <p className="mb-1 font-medium text-white">
              Printora Editor Opened!
            </p>
            <p className="mb-4 text-center text-sm text-zinc-400 px-6">
              A new tab has opened with {merch?.title ?? "your merch"}.
              Customize and place your order.
            </p>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/5 px-6 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10"
            >
              Back to Gallery
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
              <X className="h-6 w-6 text-red-400" />
            </div>
            <p className="mb-1 font-medium text-white">Something went wrong</p>
            <p className="mb-4 text-center text-sm text-zinc-400 px-6">
              {error || "Failed to create session. Please try again."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10"
              >
                Close
              </button>
              <button
                onClick={() => setStep("idle")}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center border-t border-white/5 py-3 text-xs text-zinc-500">
          <span>
            Print fulfillment by{" "}
            <span className="font-semibold text-zinc-400">Printora</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ============ Main Page ============

export default function DreamCanvasPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(
    null
  );
  const [printImage, setPrintImage] = useState<GalleryImage | null>(null);

  const filteredImages =
    activeCategory === "all" || activeCategory === "trending"
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Header />
      <FilterBar active={activeCategory} onSelect={setActiveCategory} />

      {/* Gallery */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        {/* Results count */}
        <div className="mb-4 text-sm text-zinc-500">
          {filteredImages.length} creations
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {filteredImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onClick={() => setSelectedImage(image)}
            />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-12 flex justify-center pb-8">
          <button disabled className="cursor-not-allowed rounded-full bg-white/5 px-8 py-2.5 text-sm font-medium text-zinc-600 opacity-40" title="Demo only">
            Load More
          </button>
        </div>
      </main>

      {/* Image Detail Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onPrint={() => {
            setPrintImage(selectedImage);
          }}
        />
      )}

      {/* Print Modal */}
      {printImage && (
        <PrintModal
          image={printImage}
          onClose={() => setPrintImage(null)}
        />
      )}
    </div>
  );
}
