"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Plus,
  Pencil,
  Power,
  Package,
  ShoppingBag,
  Loader2,
  Search,
  X,
  Check,
  Save,
  Tag,
} from "lucide-react";
import {
  CREATORS,
  DEMO_USER,
} from "../data";
import type { Creator, MerchInfo, MerchVariant } from "../data";

// ============ Creator Selector ============

function CreatorSelector({
  selected,
  onSelect,
}: {
  selected: Creator | null;
  onSelect: (creator: Creator) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const creatorList = Object.values(CREATORS);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:border-white/20 hover:bg-white/10"
      >
        {selected ? (
          <>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${selected.gradient} text-sm font-bold text-white`}
            >
              {selected.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-white">{selected.name}</div>
              <div className="truncate text-xs text-zinc-500">
                @{selected.slug}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 text-sm text-zinc-500">
            Select a creator to manage...
          </div>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-[#14141f] shadow-2xl shadow-black/50">
          {creatorList.map((creator) => {
            const isActive = selected?.id === creator.id;
            return (
              <button
                key={creator.id}
                onClick={() => {
                  onSelect(creator);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                  isActive ? "bg-violet-500/10" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${creator.gradient} text-xs font-bold text-white`}
                >
                  {creator.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">
                    {creator.name}
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {creator.description}
                  </div>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 shrink-0 text-violet-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ Merch Card ============

interface MerchWithStatus extends MerchInfo {
  active: boolean;
  stockLimit?: number | null;
  stockSold?: number;
  stockRemaining?: number | null;
  isLimitedEdition?: boolean;
}

function MerchCard({
  merch,
  onEdit,
  onToggleActive,
}: {
  merch: MerchWithStatus;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const minPrice = Math.min(...merch.variants.map((v) => v.price));
  const maxPrice = Math.max(...merch.variants.map((v) => v.price));
  const priceLabel =
    minPrice === maxPrice
      ? `$${minPrice.toFixed(2)}`
      : `$${minPrice.toFixed(2)} — $${maxPrice.toFixed(2)}`;
  const colorCount = new Set(merch.variants.map((v) => v.color)).size;

  return (
    <div className={`group overflow-hidden rounded-xl border transition-all ${
      merch.active
        ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
        : "border-white/5 bg-white/[0.01] opacity-60"
    }`}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        {merch.imageUrl ? (
          <img
            src={merch.imageUrl}
            alt={merch.title}
            className={`h-full w-full object-cover transition-transform ${merch.active ? "group-hover:scale-105" : "grayscale"}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-zinc-700" />
          </div>
        )}
        {/* Inactive badge */}
        {!merch.active && (
          <div className="absolute left-3 top-3 rounded-full bg-zinc-800/90 px-2.5 py-1 text-xs font-medium text-zinc-400 backdrop-blur-sm">
            Inactive
          </div>
        )}
        {/* Overlay actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleActive}
            className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
              merch.active
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            }`}
            title={merch.active ? "Deactivate" : "Activate"}
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {merch.category}
          </span>
          {merch.active ? (
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
              Active
            </span>
          ) : (
            <span className="rounded bg-zinc-500/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Inactive
            </span>
          )}
        </div>
        <h3 className="mb-1 font-semibold text-white">{merch.title}</h3>
        <p className="mb-2 text-xs text-zinc-500">{merch.productName}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-violet-400">
            {priceLabel}
          </span>
          <span className="text-xs text-zinc-400">
            {colorCount} color{colorCount !== 1 ? "s" : ""}
          </span>
        </div>
        {/* Stock info */}
        {merch.isLimitedEdition ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {merch.stockRemaining === 0 ? (
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-medium text-red-400">
                Sold out
              </span>
            ) : (
              <>
                <span className="rounded bg-violet-500/20 px-1.5 py-0.5 font-medium text-violet-400">
                  Limited
                </span>
                <span className="text-zinc-500">
                  {merch.stockRemaining}/{merch.stockLimit} left
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="mt-2 text-xs text-zinc-600">Unlimited stock</div>
        )}
      </div>
    </div>
  );
}

// ============ Product Catalog (fetched from Printora BE) ============
// GET /api/v1/catalog/products returns products with real UUIDs

interface CatalogVariant {
  id: string;
  color: string;
  colorCode?: string | null;
  size: string;
  end_price?: number;
  endPrice?: number;
}

interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  description?: string;
  variants: CatalogVariant[];
}

// Group catalog variants by color for the color picker UI
interface ProductColor {
  name: string;
  colorCode: string | null;
  variants: CatalogVariant[]; // all size variants for this color
}

interface ProductCatalogItem {
  id: string;       // real productId from BE
  name: string;
  category: string;
  colors: ProductColor[];
  allVariants: CatalogVariant[];
}

function catalogToProducts(products: CatalogProduct[]): ProductCatalogItem[] {
  return products.map((p) => {
    // Group variants by color, dedup by color+size
    const colorMap = new Map<string, ProductColor>();
    const seen = new Set<string>();
    for (const v of p.variants) {
      const key = `${v.color}|${v.size}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!colorMap.has(v.color)) {
        const rawCode = v.colorCode ?? null;
        const colorCode = rawCode && !rawCode.startsWith("#") ? `#${rawCode}` : rawCode;
        colorMap.set(v.color, {
          name: v.color,
          colorCode,
          variants: [],
        });
      }
      colorMap.get(v.color)!.variants.push(v);
    }
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      colors: [...colorMap.values()],
      allVariants: p.variants,
    };
  });
}

// Generate MerchVariant[] from selected colors (uses real variant IDs from catalog)
function generateVariants(
  product: ProductCatalogItem,
  selectedColors: string[]
): MerchVariant[] {
  const variants: MerchVariant[] = [];
  for (const colorName of selectedColors) {
    const color = product.colors.find((c) => c.name === colorName);
    if (!color) continue;
    for (const v of color.variants) {
      const rawCode = v.colorCode ?? null;
      const code = rawCode && !rawCode.startsWith("#") ? `#${rawCode}` : rawCode;
      variants.push({
        id: v.id,  // real variant UUID from Printora BE
        color: v.color,
        colorCode: code,
        size: v.size,
        price: v.endPrice ?? v.end_price ?? 0,
      });
    }
  }
  return variants;
}

// Get unique colors from existing merch variants
function getUniqueColors(variants: MerchVariant[]): string[] {
  return [...new Set(variants.map((v) => v.color))];
}

// Find catalog product by name
function findProduct(catalog: ProductCatalogItem[], name: string): ProductCatalogItem | undefined {
  return catalog.find((p) => p.name === name);
}

// ============ Color Picker with Search ============

function ColorPicker({
  colors,
  selected,
  onToggle,
  label,
  required,
}: {
  colors: ProductColor[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  label?: string;
  required?: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? colors.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : colors;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label ?? "Color Variants"}{required ? " *" : ""} ({selected.size} selected)
        </label>
      </div>
      <p className="mb-2 text-xs text-zinc-400">
        Select colors to offer. All sizes are auto-included per color.
      </p>
      {colors.length > 6 && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colors..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {filtered.map((c) => {
          const isSelected = selected.has(c.name);
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onToggle(c.name)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                isSelected
                  ? "border-violet-500/50 bg-violet-500/10"
                  : "border-white/5 bg-white/[0.02] opacity-50 hover:opacity-80"
              }`}
            >
              <div
                className="h-5 w-5 shrink-0 rounded-full border border-white/20"
                style={{ backgroundColor: c.colorCode ?? "#666" }}
              />
              <span className="text-sm text-white">{c.name}</span>
              {isSelected && (
                <Check className="h-3.5 w-3.5 text-violet-400" />
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-zinc-500">No colors match &ldquo;{search}&rdquo;</p>
        )}
      </div>
    </div>
  );
}

// ============ Edit Merch Modal ============

function EditMerchModal({
  merch,
  catalog,
  onClose,
  onSave,
}: {
  merch: MerchWithStatus;
  catalog: ProductCatalogItem[];
  onClose: () => void;
  onSave: (updated: MerchInfo) => void;
}) {
  const [title, setTitle] = useState(merch.title);
  const [description, setDescription] = useState(merch.description);
  const [imageUrl, setImageUrl] = useState(merch.imageUrl);

  // Current colors from merch variants
  const currentColors = getUniqueColors(merch.variants);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(
    new Set(currentColors)
  );

  const product = findProduct(catalog, merch.productName);
  const availableColors = product?.colors ?? [];

  function toggleColor(colorName: string) {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      if (next.has(colorName)) {
        if (next.size <= 1) return prev;
        next.delete(colorName);
      } else {
        next.add(colorName);
      }
      return next;
    });
  }

  function handleSave() {
    if (product) {
      const variants = generateVariants(product, [...selectedColors]);
      onSave({ ...merch, title, description, imageUrl, variants });
    } else {
      onSave({ ...merch, title, description, imageUrl });
    }
  }

  // Sizes description — extract unique sizes from all variants
  const allSizes = product
    ? [...new Set(product.allVariants.map((v) => v.size))]
    : [...new Set(merch.variants.map((v) => v.size))];
  const sizesLabel = allSizes.join(", ");
  const basePrice = product
    ? Math.min(...product.allVariants.map((v) => v.endPrice ?? v.end_price ?? 0))
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12121a]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Edit Merch</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Image URL
              </label>
              <div className="flex gap-3">
                {imageUrl && (
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Product info (read-only) */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Product
              </label>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-400">
                {merch.productName}
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                Sizes: {sizesLabel} &mdash; from ${basePrice > 0 ? `$${basePrice.toFixed(2)}` : "—"} each
              </p>
            </div>

            {/* Stock info */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Stock
              </label>
              <div className="flex items-center gap-4">
                {merch.isLimitedEdition ? (
                  <>
                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2">
                      <span className="text-xs text-zinc-400">Remaining </span>
                      <span className="text-sm font-semibold text-violet-400">{merch.stockRemaining}</span>
                      <span className="text-xs text-zinc-500">/{merch.stockLimit}</span>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                      <span className="text-xs text-zinc-400">Sold </span>
                      <span className="text-sm font-medium text-white">{merch.stockSold}</span>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-zinc-400">
                    Unlimited stock
                  </div>
                )}
              </div>
            </div>

            {/* Color variant selector */}
            <ColorPicker
              colors={availableColors}
              selected={selectedColors}
              onToggle={toggleColor}
            />
          </div>
        </div>

        {/* Footer — fixed at bottom, outside scroll */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/5 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Create Merch Modal ============

function CreateMerchModal({
  creator,
  catalog,
  onClose,
  onCreate,
}: {
  creator: Creator;
  catalog: ProductCatalogItem[];
  onClose: () => void;
  onCreate: (merch: MerchInfo & { productId: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductCatalogItem>(catalog[0]);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());

  function handleProductChange(productId: string) {
    const product = catalog.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setSelectedColors(new Set());
    }
  }

  function toggleColor(colorName: string) {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      if (next.has(colorName)) {
        next.delete(colorName);
      } else {
        next.add(colorName);
      }
      return next;
    });
  }

  function handleCreate() {
    if (!title.trim() || selectedColors.size === 0) return;
    const variants = generateVariants(selectedProduct, [...selectedColors]);
    const newMerch = {
      id: "",  // will be assigned by BE
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      productId: selectedProduct.id,  // real productId from catalog
      productName: selectedProduct.name,
      category: selectedProduct.category,
      variants,
    };
    onCreate(newMerch);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#12121a]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#12121a] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Create New Merch
            </h2>
            <p className="text-xs text-zinc-500">
              for {creator.name} (@{creator.slug})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cosmic Galaxy Tee"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short description for this merch"
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Image URL
            </label>
            <div className="flex gap-3">
              {imageUrl && (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Product selector */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Product
            </label>
            <select
              value={selectedProduct.id}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              {catalog.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#12121a]">
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-zinc-400">
              Sizes: {[...new Set(selectedProduct.allVariants.map((v) => v.size))].join(", ")} &mdash; from ${Math.min(...selectedProduct.allVariants.map((v) => v.endPrice ?? v.end_price ?? 0)).toFixed(2)} each
            </p>
          </div>

          {/* Color variant selector */}
          <ColorPicker
            colors={selectedProduct.colors}
            selected={selectedColors}
            onToggle={toggleColor}
            required
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-white/5 bg-[#12121a] px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || selectedColors.size === 0}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Create Merch
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Delete Confirmation ============

function DeactivateConfirmModal({
  merch,
  onClose,
  onConfirm,
}: {
  merch: MerchWithStatus;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isDeactivating = merch.active;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#12121a]">
        <div className="p-6 text-center">
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isDeactivating ? "bg-amber-500/20" : "bg-emerald-500/20"
          }`}>
            <Power className={`h-6 w-6 ${isDeactivating ? "text-amber-400" : "text-emerald-400"}`} />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">
            {isDeactivating ? "Deactivate" : "Activate"} Merch?
          </h3>
          <p className="mb-6 text-sm text-zinc-400">
            {isDeactivating
              ? <>Are you sure you want to deactivate &ldquo;{merch.title}&rdquo;? It will be hidden from the storefront but can be reactivated later.</>
              : <>Reactivate &ldquo;{merch.title}&rdquo;? It will be visible on the storefront again.</>
            }
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                isDeactivating
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isDeactivating ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Main Creator Dashboard ============

export default function CreatorDashboardPage() {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [merchList, setMerchList] = useState<MerchWithStatus[]>([]);
  const [editingMerch, setEditingMerch] = useState<MerchWithStatus | null>(null);
  const [togglingMerch, setTogglingMerch] = useState<MerchWithStatus | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<ProductCatalogItem[]>([]);
  const [editorUrl, setEditorUrl] = useState<string | null>(null);

  // Fetch product catalog from Printora BE on mount
  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch("/api/catalog?limit=100");
        const json = await res.json();
        // Handle both response formats: { products: [...] } or { data: { products: [...] } }
        const products = json.products ?? json.data?.products ?? [];
        if (res.ok && products.length > 0) {
          setCatalog(catalogToProducts(products));
        } else {
          console.error("Catalog response:", json);
        }
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      }
    }
    fetchCatalog();
  }, []);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  function showError(msg: string) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  }

  // Load merch from Printora BE when creator is selected
  async function handleSelectCreator(creator: Creator) {
    setSelectedCreator(creator);
    setLoading(true);
    setErrorMsg(null);

    try {
      // GET merch from Printora BE via our API route
      const res = await fetch(`/api/merch?creatorId=${creator.id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setMerchList(json.data);
      }
    } catch {
      setMerchList([]);
      showError("Failed to load merch catalog.");
    } finally {
      setLoading(false);
    }
  }

  // Edit merch — PUT /api/merch/[id]
  async function handleSaveEdit(updated: MerchInfo) {
    if (!selectedCreator) return;

    try {
      const res = await fetch(`/api/merch/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: selectedCreator.id,
          title: updated.title,
          description: updated.description,
          imageUrl: updated.imageUrl,
          productName: updated.productName,
          category: updated.category,
          variantIds: updated.variants.map((v) => v.id),
          variants: updated.variants,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        // Merge server response with frontend data (server may have sparse data after hot-reload)
        setMerchList((prev) =>
          prev.map((m) =>
            m.id === updated.id ? { ...updated, active: m.active, ...json.data } : m
          )
        );
        if (json.warning) {
          showSuccess(`"${updated.title}" updated (BE unreachable, saved locally).`);
        } else {
          showSuccess(`"${updated.title}" updated successfully!`);
        }
      } else {
        showError(json.error || "Failed to update merch.");
      }
    } catch {
      // Network error — update from frontend state
      setMerchList((prev) =>
        prev.map((m) => (m.id === updated.id ? { ...updated, active: m.active } : m))
      );
      showError("Network error. Changes saved locally.");
    }
    setEditingMerch(null);
  }

  // Toggle active — PATCH /api/merch/[id]
  async function handleToggleActive() {
    if (!togglingMerch) return;
    const newActive = !togglingMerch.active;

    try {
      await fetch(`/api/merch/${togglingMerch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive, creatorId: selectedCreator?.id }),
      });
    } catch {
      // Printora API call may fail — that's ok, we update locally
    }

    // Always update from frontend state (don't rely on server response data)
    setMerchList((prev) =>
      prev.map((m) => (m.id === togglingMerch.id ? { ...m, active: newActive } : m))
    );
    setTogglingMerch(null);
    showSuccess(`"${togglingMerch.title}" ${newActive ? "activated" : "deactivated"}.`);
  }

  // Create merch — POST /api/merch
  async function handleCreate(newMerch: MerchInfo & { productId?: string }) {
    if (!selectedCreator) return;

    try {
      const res = await fetch("/api/merch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMerch,
          creatorId: selectedCreator.id,
          variantIds: newMerch.variants.map((v) => v.id),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setMerchList((prev) => [...prev, json.data]);
        if (json.editSession?.editorUrl) {
          setEditorUrl(json.editSession.editorUrl);
        }
        showSuccess(`"${newMerch.title}" created!`);
      } else {
        const json = await res.json();
        showError(json.error || "Failed to create merch.");
        return;
      }
    } catch {
      // Fallback: add locally
      setMerchList((prev) => [...prev, { ...newMerch, active: true }]);
      showSuccess(`"${newMerch.title}" created locally.`);
    }
    setShowCreate(false);
  }

  // Stats for selected creator
  const activeCount = merchList.filter((m) => m.active).length;
  const totalVariants = merchList.reduce(
    (sum, m) => sum + m.variants.length,
    0
  );
  const priceRange =
    merchList.length > 0
      ? {
          min: Math.min(
            ...merchList.flatMap((m) => m.variants.map((v) => v.price))
          ),
          max: Math.max(
            ...merchList.flatMap((m) => m.variants.map((v) => v.price))
          ),
        }
      : null;

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a12]/90 backdrop-blur-xl">
        <div className="border-b border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-center">
          <p className="text-sm text-violet-300">
            <span className="mr-2 inline-flex items-center rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-violet-400">
              Creator Mode
            </span>
            You are managing merch as a creator. This is a simulated dashboard.
          </p>
        </div>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <Link
            href="/ai-image-app"
            className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Dream<span className="text-violet-400">Canvas</span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white">
              JD
            </div>
            <span className="hidden text-zinc-400 sm:inline">
              {DEMO_USER.name}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-white">
            Creator Dashboard
          </h1>
          <p className="text-sm text-zinc-500">
            Select a creator profile to view and manage their merchandise.
          </p>
        </div>

        {/* Creator selector */}
        <div className="mb-8 max-w-md">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Switch Creator
          </label>
          <CreatorSelector
            selected={selectedCreator}
            onSelect={handleSelectCreator}
          />
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">{successMsg}</span>
          </div>
        )}

        {/* Error toast */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
            <X className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300">{errorMsg}</span>
          </div>
        )}

        {/* No creator selected */}
        {!selectedCreator && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <ShoppingBag className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-400">
              No Creator Selected
            </h3>
            <p className="text-sm text-zinc-600">
              Choose a creator above to manage their merch catalog.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && selectedCreator && (
          <div className="flex flex-col items-center py-16">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <p className="text-sm text-zinc-500">Loading merch catalog...</p>
          </div>
        )}

        {/* Creator selected — show dashboard */}
        {selectedCreator && !loading && (
          <>
            {/* Creator info bar */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${selectedCreator.gradient} text-lg font-bold text-white`}
                >
                  {selectedCreator.avatar}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedCreator.name}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    @{selectedCreator.slug}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {selectedCreator.description}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">
                    {activeCount}<span className="text-sm text-zinc-500">/{merchList.length}</span>
                  </div>
                  <div className="text-xs text-zinc-500">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">
                    {totalVariants}
                  </div>
                  <div className="text-xs text-zinc-500">Variants</div>
                </div>
                {priceRange && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-violet-400">
                      ${priceRange.min.toFixed(0)}—${priceRange.max.toFixed(0)}
                    </div>
                    <div className="text-xs text-zinc-500">Price Range</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions bar */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-400">
                Merch Catalog ({merchList.length})
              </h3>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:shadow-xl hover:shadow-violet-600/30"
              >
                <Plus className="h-4 w-4" />
                New Merch
              </button>
            </div>

            {/* Merch grid */}
            {merchList.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 py-16">
                <Tag className="mb-3 h-8 w-8 text-zinc-600" />
                <p className="mb-4 text-sm text-zinc-500">
                  No merch items yet for this creator.
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
                >
                  <Plus className="h-4 w-4" />
                  Create First Merch
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {merchList.map((merch) => (
                  <MerchCard
                    key={merch.id}
                    merch={merch}

                    onEdit={() => setEditingMerch(merch)}
                    onToggleActive={() => setTogglingMerch(merch)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {editingMerch && (
        <EditMerchModal
          merch={editingMerch}
          catalog={catalog}
          onClose={() => setEditingMerch(null)}
          onSave={handleSaveEdit}
        />
      )}

      {togglingMerch && (
        <DeactivateConfirmModal
          merch={togglingMerch}
          onClose={() => setTogglingMerch(null)}
          onConfirm={handleToggleActive}
        />
      )}

      {showCreate && selectedCreator && catalog.length > 0 && (
        <CreateMerchModal
          creator={selectedCreator}
          catalog={catalog}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Editor URL modal — shown after successful merch creation */}
      {editorUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#12121a]">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Merch Created!
              </h3>
              <p className="mb-6 text-sm text-zinc-400">
                Your merch has been created. Open the editor to customize the design on your product.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href={editorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setEditorUrl(null)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:shadow-xl"
                >
                  <Sparkles className="h-4 w-4" />
                  Open Design Editor
                </a>
                <button
                  onClick={() => setEditorUrl(null)}
                  className="rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
