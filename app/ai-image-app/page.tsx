"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Heart,
  Share2,
  X,
  Search,
  Sparkles,
  Eye,
  MessageCircle,
  ArrowRight,
  Loader2,
  ExternalLink,
  Zap,
  TrendingUp,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";

// ============ Types ============

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  creator: string;
  avatar: string;
  prompt: string;
  model: string;
  likes: number;
  views: number;
  comments: number;
  height: "short" | "medium" | "tall" | "xtall";
  category: string;
  createdAt: string;
}

type PrintStep = "idle" | "form" | "loading" | "success" | "error";

// ============ Image Data ============

const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "1",
    url: "https://picsum.photos/seed/dc-enchanted/600/800",
    title: "Enchanted Forest Gateway",
    creator: "luna_creates",
    avatar: "L",
    prompt:
      "An enchanted forest gateway glowing with bioluminescent light, mystical atmosphere, fairy tale aesthetic, volumetric lighting, 8k",
    model: "DreamCanvas XL v3.2",
    likes: 3847,
    views: 28420,
    comments: 142,
    height: "tall",
    category: "fantasy",
    createdAt: "2h ago",
  },
  {
    id: "2",
    url: "https://picsum.photos/seed/dc-neon/600/600",
    title: "Neon Soul",
    creator: "pixel_nomad",
    avatar: "P",
    prompt:
      "Cyberpunk portrait with neon reflections, photorealistic, dramatic rim lighting, rain drops, moody atmosphere",
    model: "DreamCanvas XL v3.2",
    likes: 5291,
    views: 41033,
    comments: 298,
    height: "medium",
    category: "portraits",
    createdAt: "4h ago",
  },
  {
    id: "3",
    url: "https://picsum.photos/seed/dc-cosmos/600/900",
    title: "Birth of Stars",
    creator: "astro_dreamer",
    avatar: "A",
    prompt:
      "Cosmic nebula with newborn stars, deep space photography style, vibrant purple and gold colors, ultra detailed, NASA-inspired",
    model: "DreamCanvas XL v3.2",
    likes: 7120,
    views: 53200,
    comments: 421,
    height: "xtall",
    category: "sci-fi",
    createdAt: "6h ago",
  },
  {
    id: "4",
    url: "https://picsum.photos/seed/dc-abstract1/600/500",
    title: "Chromatic Waves",
    creator: "color_theory",
    avatar: "C",
    prompt:
      "Abstract flowing liquid art, chromatic aberration, iridescent metallic surface, macro photography style, vibrant spectrum",
    model: "DreamCanvas v2.8",
    likes: 2156,
    views: 18700,
    comments: 87,
    height: "short",
    category: "abstract",
    createdAt: "8h ago",
  },
  {
    id: "5",
    url: "https://picsum.photos/seed/dc-tiger/600/750",
    title: "Spirit of the Wild",
    creator: "nature_ai",
    avatar: "N",
    prompt:
      "Majestic tiger spirit animal dissolving into particles of light, ethereal, magical realism, studio lighting, award winning",
    model: "DreamCanvas XL v3.2",
    likes: 4589,
    views: 35600,
    comments: 203,
    height: "tall",
    category: "animals",
    createdAt: "10h ago",
  },
  {
    id: "6",
    url: "https://picsum.photos/seed/dc-cityscape/600/400",
    title: "Neo Tokyo 2099",
    creator: "future_vision",
    avatar: "F",
    prompt:
      "Futuristic cyberpunk cityscape at night, flying cars, holographic advertisements, rain-soaked streets, blade runner inspired",
    model: "DreamCanvas XL v3.2",
    likes: 6834,
    views: 48100,
    comments: 356,
    height: "short",
    category: "sci-fi",
    createdAt: "12h ago",
  },
  {
    id: "7",
    url: "https://picsum.photos/seed/dc-mountain/600/850",
    title: "Celestial Peaks",
    creator: "wanderlust_ai",
    avatar: "W",
    prompt:
      "Majestic mountain range under the milky way, aurora borealis, long exposure photography style, crystalline lake reflection",
    model: "DreamCanvas v2.8",
    likes: 8901,
    views: 67800,
    comments: 512,
    height: "xtall",
    category: "landscapes",
    createdAt: "14h ago",
  },
  {
    id: "8",
    url: "https://picsum.photos/seed/dc-underwater/600/700",
    title: "Deep Blue Dreams",
    creator: "ocean_mind",
    avatar: "O",
    prompt:
      "Ethereal underwater scene with bioluminescent jellyfish, coral cathedral, divine light rays, fantasy ocean kingdom",
    model: "DreamCanvas XL v3.2",
    likes: 3245,
    views: 24900,
    comments: 156,
    height: "tall",
    category: "fantasy",
    createdAt: "16h ago",
  },
  {
    id: "9",
    url: "https://picsum.photos/seed/dc-garden/600/600",
    title: "Quantum Garden",
    creator: "synth_flora",
    avatar: "S",
    prompt:
      "Surreal garden where flowers are made of crystallized light, impossible geometry, M.C. Escher meets nature, vivid colors",
    model: "DreamCanvas XL v3.2",
    likes: 4102,
    views: 31200,
    comments: 189,
    height: "medium",
    category: "abstract",
    createdAt: "18h ago",
  },
  {
    id: "10",
    url: "https://picsum.photos/seed/dc-samurai/600/800",
    title: "Last Samurai's Dream",
    creator: "edo_visions",
    avatar: "E",
    prompt:
      "Samurai warrior meditating under cherry blossoms, ukiyo-e art style meets photorealism, dramatic composition, golden hour",
    model: "DreamCanvas XL v3.2",
    likes: 6578,
    views: 49300,
    comments: 387,
    height: "tall",
    category: "fantasy",
    createdAt: "20h ago",
  },
  {
    id: "11",
    url: "https://picsum.photos/seed/dc-robot/600/500",
    title: "Mechanical Heart",
    creator: "steampunk_lab",
    avatar: "M",
    prompt:
      "Steampunk robot with a glowing heart, intricate brass gears, Victorian laboratory, warm amber lighting, cinematic",
    model: "DreamCanvas v2.8",
    likes: 2890,
    views: 21500,
    comments: 134,
    height: "short",
    category: "sci-fi",
    createdAt: "22h ago",
  },
  {
    id: "12",
    url: "https://picsum.photos/seed/dc-wolf/600/750",
    title: "Moonlit Guardian",
    creator: "nature_ai",
    avatar: "N",
    prompt:
      "Wolf howling at a luminous full moon, northern lights dancing, snow-covered pine forest, photorealistic, mystical energy",
    model: "DreamCanvas XL v3.2",
    likes: 5432,
    views: 39800,
    comments: 267,
    height: "tall",
    category: "animals",
    createdAt: "1d ago",
  },
  {
    id: "13",
    url: "https://picsum.photos/seed/dc-temple/600/650",
    title: "Forgotten Temple",
    creator: "ruins_explorer",
    avatar: "R",
    prompt:
      "Ancient temple overgrown with glowing vines, rays of light through broken ceiling, atmospheric fog, Indiana Jones vibes",
    model: "DreamCanvas XL v3.2",
    likes: 4210,
    views: 33100,
    comments: 198,
    height: "medium",
    category: "fantasy",
    createdAt: "1d ago",
  },
  {
    id: "14",
    url: "https://picsum.photos/seed/dc-aurora/600/450",
    title: "Aurora Cascade",
    creator: "wanderlust_ai",
    avatar: "W",
    prompt:
      "Spectacular aurora borealis over Icelandic landscape, waterfall in foreground, long exposure, night photography masterpiece",
    model: "DreamCanvas v2.8",
    likes: 9234,
    views: 72100,
    comments: 601,
    height: "short",
    category: "landscapes",
    createdAt: "1d ago",
  },
  {
    id: "15",
    url: "https://picsum.photos/seed/dc-dragon/600/900",
    title: "Dragon's Awakening",
    creator: "myth_maker",
    avatar: "D",
    prompt:
      "Enormous dragon emerging from a volcano, wings spread wide, molten lava, epic scale, dark fantasy, cinematic composition",
    model: "DreamCanvas XL v3.2",
    likes: 11203,
    views: 89400,
    comments: 743,
    height: "xtall",
    category: "fantasy",
    createdAt: "2d ago",
  },
  {
    id: "16",
    url: "https://picsum.photos/seed/dc-girl/600/700",
    title: "Electric Dreams",
    creator: "synth_wave",
    avatar: "S",
    prompt:
      "Synthwave retro portrait, glowing grid lines, sunset gradient sky, chrome reflections, 80s aesthetic, outrun style",
    model: "DreamCanvas v2.8",
    likes: 3678,
    views: 27900,
    comments: 172,
    height: "tall",
    category: "portraits",
    createdAt: "2d ago",
  },
];

const CATEGORIES = [
  "all",
  "trending",
  "fantasy",
  "portraits",
  "landscapes",
  "abstract",
  "sci-fi",
  "animals",
];

const HEIGHT_CLASSES: Record<GalleryImage["height"], string> = {
  short: "h-48 sm:h-56",
  medium: "h-56 sm:h-72",
  tall: "h-72 sm:h-88",
  xtall: "h-80 sm:h-[26rem]",
};

// ============ Helpers ============

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

// ============ Header ============

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Dream<span className="text-violet-400">Canvas</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {["Create", "Browse", "Models", "Community"].map((item) => (
            <button
              key={item}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                item === "Browse"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden max-w-xs flex-1 px-6 lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search creations..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/25"
            />
          </div>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <button className="hidden text-sm text-zinc-400 hover:text-white sm:block">
            Log in
          </button>
          <button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25">
            Sign Up
          </button>
        </div>
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
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-all ${
                active === cat
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat === "trending" && (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              {cat === "all" && <Grid3X3 className="h-3.5 w-3.5" />}
              {cat}
            </button>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/10 hover:text-white">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Aspect</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/10 hover:text-white">
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

  // Handle images that load before React hydration
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
        {/* Loading skeleton */}
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
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
                {image.avatar}
              </div>
              <span className="text-sm font-medium text-white">
                @{image.creator}
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                {image.avatar}
              </div>
              <div>
                <div className="font-medium text-white">
                  @{image.creator}
                </div>
                <div className="text-xs text-zinc-500">{image.createdAt}</div>
              </div>
            </div>
          </div>

          {/* Details — scrollable */}
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

          {/* Print CTA — pinned to bottom */}
          <div className="border-t border-white/5 p-4">
            <button
              onClick={onPrint}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:shadow-xl hover:shadow-violet-600/30"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print as Wall Art
              <ArrowRight className="h-4 w-4" />
            </button>
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

// ============ Print Modal ============

function PrintModal({
  image,
  onClose,
}: {
  image: GalleryImage;
  onClose: () => void;
}) {
  const [step, setStep] = useState<PrintStep>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!name.trim() || !email.trim()) {
        setError("Please fill in all fields");
        return;
      }

      setStep("loading");

      try {
        const res = await fetch("/api/printora/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: image.url,
            userData: { name: name.trim(), email: email.trim() },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create session");
        }

        setStep("success");

        // Open Printora editor in new tab
        if (data.editorUrl) {
          window.open(data.editorUrl, "_blank");
        }
      } catch (err) {
        setStep("error");
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      }
    },
    [image.url, name, email]
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#12121a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with image preview */}
        <div className="flex items-center gap-4 border-b border-white/5 p-5">
          <div className="h-16 w-16 overflow-hidden rounded-lg">
            <img
              src={image.url}
              alt={image.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-white">Print Your Art</h3>
            <p className="text-sm text-zinc-400">
              Turn &ldquo;{image.title}&rdquo; into premium wall art
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/25"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-600/25"
                >
                  Continue to Printora
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-400" />
              <p className="text-sm text-zinc-300">
                Setting up your print session...
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <svg
                  className="h-6 w-6 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="mb-1 font-medium text-white">
                Printora Editor Opened!
              </p>
              <p className="mb-4 text-center text-sm text-zinc-400">
                A new tab has opened with the Printora editor. Customize
                your print and complete your order there.
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
            <div className="flex flex-col items-center py-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                <X className="h-6 w-6 text-red-400" />
              </div>
              <p className="mb-1 font-medium text-white">
                Something went wrong
              </p>
              <p className="mb-4 text-center text-sm text-zinc-400">
                {error || "Failed to create print session. Please try again."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setStep("form");
                    setError("");
                  }}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

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

        {/* Load more hint */}
        <div className="mt-12 flex justify-center pb-8">
          <button className="rounded-full bg-white/5 px-8 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-white/10 hover:text-white">
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
