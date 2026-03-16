// ============ Shared Types ============

export interface Creator {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  description: string;
  gradient: string;
}

export interface MerchVariant {
  id: string;
  color: string;
  colorCode: string | null;
  size: string;
  price: number;
}

export interface MerchInfo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  productName: string;
  category: string;
  variants: MerchVariant[];
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  creatorId: string;
  merchId?: string;
  prompt: string;
  model: string;
  likes: number;
  views: number;
  comments: number;
  height: "short" | "medium" | "tall" | "xtall";
  category: string;
  createdAt: string;
}

export type PrintStep = "idle" | "form" | "loading" | "success" | "error";

export const DEMO_USER = { name: "John Doe", email: "john@example.com" };

// ============ Creator Data ============
// Each creator has a unique UUID (as returned by Printora API)

export const CREATORS: Record<string, Creator> = {
  "d4c29376-8f12-40c2-983a-c1d362d4914a": {
    id: "d4c29376-8f12-40c2-983a-c1d362d4914a",
    name: "Luna Creates",
    slug: "luna-creates-9gn6",
    avatar: "LC",
    description: "Fantasy & enchanted world artist. Specializing in mystical landscapes and magical realism.",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  "7efd3b6e-e7de-40a2-889a-2593e8cbc854": {
    id: "7efd3b6e-e7de-40a2-889a-2593e8cbc854",
    name: "Pixel Nomad",
    slug: "pixel-nomad-woyq",
    avatar: "PN",
    description: "Cyberpunk portrait specialist. Neon-lit visions of the future.",
    gradient: "from-cyan-500 to-blue-500",
  },
  "028de50a-6194-4a32-a610-22655e7b1c3c": {
    id: "028de50a-6194-4a32-a610-22655e7b1c3c",
    name: "Astro Dreamer",
    slug: "astro-dreamer-o7a6",
    avatar: "AD",
    description: "Deep space explorer. NASA-inspired cosmic art and nebula compositions.",
    gradient: "from-purple-500 to-indigo-500",
  },
  "76f69027-62a5-4a61-9d8d-470ebd5204ec": {
    id: "76f69027-62a5-4a61-9d8d-470ebd5204ec",
    name: "Color Theory",
    slug: "color-theory-2i0w",
    avatar: "CT",
    description: "Abstract art innovator. Liquid chromatic compositions and spectral experiments.",
    gradient: "from-pink-500 to-rose-500",
  },
  "542b4ceb-13d9-4bd6-9600-fab2f58af018": {
    id: "542b4ceb-13d9-4bd6-9600-fab2f58af018",
    name: "Nature AI",
    slug: "nature-ai-dlq4",
    avatar: "NA",
    description: "Wildlife & spirit animal artist. Ethereal nature scenes with magical realism.",
    gradient: "from-emerald-500 to-teal-500",
  },
  "f87c5f80-c24c-498a-a930-648bb1bd4e81": {
    id: "f87c5f80-c24c-498a-a930-648bb1bd4e81",
    name: "Future Vision",
    slug: "future-vision-w5j9",
    avatar: "FV",
    description: "Sci-fi cityscape architect. Blade Runner meets anime aesthetics.",
    gradient: "from-amber-500 to-orange-500",
  },
  "438969c3-f9db-4795-ba8d-9825e6fa9309": {
    id: "438969c3-f9db-4795-ba8d-9825e6fa9309",
    name: "Wanderlust AI",
    slug: "wanderlust-ai-p0wg",
    avatar: "WA",
    description: "Landscape photography reimagined. Aurora, mountains, and celestial wonders.",
    gradient: "from-sky-500 to-cyan-500",
  },
  "18143590-b192-45fe-8f9b-2005e2a6e2db": {
    id: "18143590-b192-45fe-8f9b-2005e2a6e2db",
    name: "Ocean Mind",
    slug: "ocean-mind-op3p",
    avatar: "OM",
    description: "Underwater fantasy creator. Bioluminescent oceans and coral kingdoms.",
    gradient: "from-blue-500 to-indigo-500",
  },
  "6c2f4a49-9e65-48aa-b237-19de59a426bf": {
    id: "6c2f4a49-9e65-48aa-b237-19de59a426bf",
    name: "Synth Flora",
    slug: "synth-flora-bzd6",
    avatar: "SF",
    description: "Surreal garden architect. Where impossible geometry meets nature.",
    gradient: "from-lime-500 to-green-500",
  },
  "87e8e477-0661-475f-b760-999de1375acf": {
    id: "87e8e477-0661-475f-b760-999de1375acf",
    name: "Edo Visions",
    slug: "edo-visions-w4ze",
    avatar: "EV",
    description: "Japanese art fusion. Ukiyo-e meets photorealism in dramatic compositions.",
    gradient: "from-red-500 to-pink-500",
  },
  "6bec2491-d51e-4df2-9f52-7a547be260d6": {
    id: "6bec2491-d51e-4df2-9f52-7a547be260d6",
    name: "Steampunk Lab",
    slug: "steampunk-lab-cxg9",
    avatar: "SL",
    description: "Victorian-era futurism. Brass gears, glowing hearts, and mechanical dreams.",
    gradient: "from-amber-600 to-yellow-500",
  },
  "1adef157-1763-42d9-8828-aca1f4401379": {
    id: "1adef157-1763-42d9-8828-aca1f4401379",
    name: "Ruins Explorer",
    slug: "ruins-explorer-qdk6",
    avatar: "RE",
    description: "Ancient temple discoverer. Overgrown ruins and forgotten civilizations.",
    gradient: "from-stone-500 to-amber-500",
  },
  "7a6e7e11-1833-4771-90ad-4c68c872ab2e": {
    id: "7a6e7e11-1833-4771-90ad-4c68c872ab2e",
    name: "Myth Maker",
    slug: "myth-maker-an00",
    avatar: "MM",
    description: "Dark fantasy illustrator. Dragons, volcanoes, and epic-scale mythological scenes.",
    gradient: "from-red-600 to-orange-500",
  },
  "45d6ba65-b95f-40f9-aba9-52fa9d7805da": {
    id: "45d6ba65-b95f-40f9-aba9-52fa9d7805da",
    name: "Synth Wave",
    slug: "synth-wave-ifoh",
    avatar: "SW",
    description: "Retro-futurism artist. 80s synthwave aesthetics with modern flair.",
    gradient: "from-fuchsia-500 to-violet-500",
  },
};

// ============ Merch Catalog ============
// Merch items with resolved variant details from Printora API

export const MERCH_CATALOG: Record<string, MerchInfo> = {
  "58902ffc-660d-4179-bf1b-e36911a01054": {
    id: "58902ffc-660d-4179-bf1b-e36911a01054",
    title: "Enchanted Forest Gateway Tee",
    description: "Mystical forest gateway on a classic unisex tee",
    imageUrl: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=600&h=800&fit=crop&q=80",
    productName: "Classic Unisex T-Shirt",
    category: "t-shirts",
    variants: [
      { id: "52de0122-658d-4592-83bc-472f916cb08e", color: "Purple", colorCode: "#800080", size: "M", price: 10.99 },
      { id: "cdb65b59-2fb3-4e57-84c3-3bc0c7a8f184", color: "Dark Heather", colorCode: "#4A4A4A", size: "XS", price: 10.99 },
    ],
  },
  "8a57055b-4d1b-4d78-b7d9-43a4d641e7ec": {
    id: "8a57055b-4d1b-4d78-b7d9-43a4d641e7ec",
    title: "Neon Soul Hoodie",
    description: "Cyberpunk portrait on a classic hoodie",
    imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=600&fit=crop&q=80",
    productName: "Classic Unisex Hoodie Gildan 18500",
    category: "hoodies",
    variants: [
      { id: "6c71deb6-8732-4007-a1ea-1e708357f78a", color: "Ash", colorCode: "#C0C0C0", size: "XL", price: 30.99 },
      { id: "864d7dba-b8f3-415a-8b24-67a2326d50e6", color: "Military Green", colorCode: "#4B5320", size: "3XL", price: 45.49 },
    ],
  },
  "453ac245-d62c-41ee-a5af-c622c2fe67e3": {
    id: "453ac245-d62c-41ee-a5af-c622c2fe67e3",
    title: "Birth of Stars Mug",
    description: "Cosmic nebula on a ceramic mug",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=900&fit=crop&q=80",
    productName: "Ceramic Mug (11oz)",
    category: "mugs",
    variants: [
      { id: "dfe4a80e-16a5-4c8f-a154-91ee76723b88", color: "White", colorCode: "#FFFFFF", size: "One Size", price: 11.49 },
    ],
  },
  "63c69f12-c7a1-4c3a-bdd0-f579ee923cd9": {
    id: "63c69f12-c7a1-4c3a-bdd0-f579ee923cd9",
    title: "Chromatic Waves Tee",
    description: "Abstract chromatic art on a bleached tee",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=500&fit=crop&q=80",
    productName: "Bleached T-Shirt",
    category: "t-shirts",
    variants: [
      { id: "4a98e045-de59-402b-9547-36c0487f3645", color: "Royal Blue", colorCode: "#4169E1", size: "3XL", price: 19.49 },
      { id: "9e0c7749-41fa-417f-9e32-0b8c1500bd50", color: "Brown", colorCode: "#A52A2A", size: "5XL", price: 25.49 },
    ],
  },
  "d96a9dbe-f8b4-4d56-b251-aecc35db7147": {
    id: "d96a9dbe-f8b4-4d56-b251-aecc35db7147",
    title: "Spirit of the Wild Hoodie",
    description: "Majestic spirit animal on a zip hoodie",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=750&fit=crop&q=80",
    productName: "All-over Print Zip Hoodie (Lightweight)",
    category: "hoodies",
    variants: [
      { id: "ff51f909-cf0b-45f8-9678-cec1dfa60d39", color: "Standard", colorCode: null, size: "S", price: 47.99 },
      { id: "7738e44a-f5de-47fb-a999-703a2a2013bd", color: "Standard", colorCode: null, size: "M", price: 47.99 },
    ],
  },
  "df8b1044-458b-41c9-8c39-2f23049ba67b": {
    id: "df8b1044-458b-41c9-8c39-2f23049ba67b",
    title: "Neo Tokyo 2099 Mug",
    description: "Cyberpunk cityscape on an accent mug",
    imageUrl: "https://images.unsplash.com/photo-1480044965905-02098d419e96?w=600&h=400&fit=crop&q=80",
    productName: "Accent Mug (11oz)",
    category: "mugs",
    variants: [
      { id: "86649ceb-8ed4-4c56-b084-a212ffec23e1", color: "Pink", colorCode: "#FFC0CB", size: "One Size", price: 11.99 },
      { id: "2618ef0f-b931-4849-a3bd-78838e886b78", color: "Black", colorCode: "#000000", size: "One Size", price: 11.99 },
    ],
  },
  "a4dc3d2e-1136-47ad-919b-0998c10c2925": {
    id: "a4dc3d2e-1136-47ad-919b-0998c10c2925",
    title: "Celestial Peaks Tee",
    description: "Mountain milky way on a comfort colors tee",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=850&fit=crop&q=80",
    productName: "Classic Unisex T-Shirt Comfort Colors 1717",
    category: "t-shirts",
    variants: [
      { id: "1d07107a-00a6-4529-8beb-ac3a0503c48b", color: "Blue Jean", colorCode: "#5DADEC", size: "M", price: 19.99 },
      { id: "0eb65b60-b283-456d-8338-5cf3fba399df", color: "Citrus", colorCode: "#A5CB0C", size: "3XL", price: 27.99 },
    ],
  },
  "cb4c0a7f-2882-437e-bb3f-67c93a236c4d": {
    id: "cb4c0a7f-2882-437e-bb3f-67c93a236c4d",
    title: "Deep Blue Dreams Mug",
    description: "Bioluminescent jellyfish on a color changing mug",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=700&fit=crop&q=80",
    productName: "Color Changing Mug (11oz)",
    category: "mugs",
    variants: [
      { id: "e8c71a9c-b5e8-41a3-b4f5-3580b9feb21a", color: "Standard", colorCode: null, size: "Default", price: 15.49 },
    ],
  },
  "99c9681e-c3d5-40a1-a293-15ae3568a4e8": {
    id: "99c9681e-c3d5-40a1-a293-15ae3568a4e8",
    title: "Quantum Garden Tee",
    description: "Surreal crystallized garden on a classic tee",
    imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=600&fit=crop&q=80",
    productName: "Classic Unisex T-Shirt",
    category: "t-shirts",
    variants: [
      { id: "52de0122-658d-4592-83bc-472f916cb08e", color: "Purple", colorCode: "#800080", size: "M", price: 10.99 },
      { id: "cdb65b59-2fb3-4e57-84c3-3bc0c7a8f184", color: "Dark Heather", colorCode: "#4A4A4A", size: "XS", price: 10.99 },
    ],
  },
  "c9a55f2f-dccc-4565-8d18-42067bc70701": {
    id: "c9a55f2f-dccc-4565-8d18-42067bc70701",
    title: "Last Samurai Dream Hoodie",
    description: "Samurai under cherry blossoms on a classic hoodie",
    imageUrl: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=600&h=800&fit=crop&q=80",
    productName: "Classic Unisex Hoodie Gildan 18500",
    category: "hoodies",
    variants: [
      { id: "6c71deb6-8732-4007-a1ea-1e708357f78a", color: "Ash", colorCode: "#C0C0C0", size: "XL", price: 30.99 },
      { id: "864d7dba-b8f3-415a-8b24-67a2326d50e6", color: "Military Green", colorCode: "#4B5320", size: "3XL", price: 45.49 },
    ],
  },
  "985a18bc-01ea-4cc9-a94d-7a143ce4d31e": {
    id: "985a18bc-01ea-4cc9-a94d-7a143ce4d31e",
    title: "Mechanical Heart Mug",
    description: "Steampunk robot on an accent mug",
    imageUrl: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=600&h=500&fit=crop&q=80",
    productName: "Accent Mug (11oz)",
    category: "mugs",
    variants: [
      { id: "86649ceb-8ed4-4c56-b084-a212ffec23e1", color: "Pink", colorCode: "#FFC0CB", size: "One Size", price: 11.99 },
      { id: "2618ef0f-b931-4849-a3bd-78838e886b78", color: "Black", colorCode: "#000000", size: "One Size", price: 11.99 },
    ],
  },
  "f0da4e3f-866d-4149-b943-fd5822640211": {
    id: "f0da4e3f-866d-4149-b943-fd5822640211",
    title: "Forgotten Temple Tee",
    description: "Ancient temple with glowing vines on a tee",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=650&fit=crop&q=80",
    productName: "Classic Unisex T-Shirt Gildan 5000",
    category: "t-shirts",
    variants: [
      { id: "86dde0a2-f4fc-4e18-8e5a-1b8377c8dc49", color: "Black", colorCode: "#000000", size: "M", price: 12.99 },
      { id: "5b3464d7-7480-47d6-a7cf-3eebe33338a0", color: "Coral Silk", colorCode: "#F5886D", size: "3XL", price: 21.49 },
    ],
  },
  "ef68cd43-5ea4-4e53-90b9-275ecc9bcdc3": {
    id: "ef68cd43-5ea4-4e53-90b9-275ecc9bcdc3",
    title: "Dragon Awakening Hoodie",
    description: "Epic dragon emerging from volcano on a zip hoodie",
    imageUrl: "https://images.unsplash.com/photo-1534312527009-56c7016453e6?w=600&h=900&fit=crop&q=80",
    productName: "All-over Print Zip Hoodie (Lightweight)",
    category: "hoodies",
    variants: [
      { id: "ff51f909-cf0b-45f8-9678-cec1dfa60d39", color: "Standard", colorCode: null, size: "S", price: 47.99 },
      { id: "7738e44a-f5de-47fb-a999-703a2a2013bd", color: "Standard", colorCode: null, size: "M", price: 47.99 },
    ],
  },
  "2f23ef76-2add-42df-ac5c-4658167f4aa1": {
    id: "2f23ef76-2add-42df-ac5c-4658167f4aa1",
    title: "Electric Dreams Tee",
    description: "Synthwave retro portrait on a classic tee",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=700&fit=crop&q=80",
    productName: "Classic Unisex T-Shirt",
    category: "t-shirts",
    variants: [
      { id: "52de0122-658d-4592-83bc-472f916cb08e", color: "Purple", colorCode: "#800080", size: "M", price: 10.99 },
      { id: "cdb65b59-2fb3-4e57-84c3-3bc0c7a8f184", color: "Dark Heather", colorCode: "#4A4A4A", size: "XS", price: 10.99 },
    ],
  },
};

export function getMerch(merchId: string): MerchInfo | null {
  return MERCH_CATALOG[merchId] ?? null;
}

// ============ Creator to Merch mapping ============
// Maps each creator to their merch items based on gallery images

export const CREATOR_MERCH_MAP: Record<string, string[]> = {
  "d4c29376-8f12-40c2-983a-c1d362d4914a": ["58902ffc-660d-4179-bf1b-e36911a01054"],
  "7efd3b6e-e7de-40a2-889a-2593e8cbc854": ["8a57055b-4d1b-4d78-b7d9-43a4d641e7ec"],
  "028de50a-6194-4a32-a610-22655e7b1c3c": ["453ac245-d62c-41ee-a5af-c622c2fe67e3"],
  "76f69027-62a5-4a61-9d8d-470ebd5204ec": ["63c69f12-c7a1-4c3a-bdd0-f579ee923cd9"],
  "542b4ceb-13d9-4bd6-9600-fab2f58af018": ["d96a9dbe-f8b4-4d56-b251-aecc35db7147"],
  "f87c5f80-c24c-498a-a930-648bb1bd4e81": ["df8b1044-458b-41c9-8c39-2f23049ba67b"],
  "438969c3-f9db-4795-ba8d-9825e6fa9309": ["a4dc3d2e-1136-47ad-919b-0998c10c2925"],
  "18143590-b192-45fe-8f9b-2005e2a6e2db": ["cb4c0a7f-2882-437e-bb3f-67c93a236c4d"],
  "6c2f4a49-9e65-48aa-b237-19de59a426bf": ["99c9681e-c3d5-40a1-a293-15ae3568a4e8"],
  "87e8e477-0661-475f-b760-999de1375acf": ["c9a55f2f-dccc-4565-8d18-42067bc70701"],
  "6bec2491-d51e-4df2-9f52-7a547be260d6": ["985a18bc-01ea-4cc9-a94d-7a143ce4d31e"],
  "1adef157-1763-42d9-8828-aca1f4401379": ["f0da4e3f-866d-4149-b943-fd5822640211"],
  "7a6e7e11-1833-4771-90ad-4c68c872ab2e": ["ef68cd43-5ea4-4e53-90b9-275ecc9bcdc3"],
  "45d6ba65-b95f-40f9-aba9-52fa9d7805da": ["2f23ef76-2add-42df-ac5c-4658167f4aa1"],
};

// ============ Gallery Images ============

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=600&h=800&fit=crop&q=80",
    title: "Enchanted Forest Gateway",
    creatorId: "d4c29376-8f12-40c2-983a-c1d362d4914a",
    merchId: "58902ffc-660d-4179-bf1b-e36911a01054",
    prompt: "An enchanted forest gateway glowing with bioluminescent light, mystical atmosphere, fairy tale aesthetic, volumetric lighting, 8k",
    model: "DreamCanvas XL v3.2",
    likes: 3847, views: 28420, comments: 142,
    height: "tall", category: "fantasy", createdAt: "2h ago",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=600&fit=crop&q=80",
    title: "Neon Soul",
    creatorId: "7efd3b6e-e7de-40a2-889a-2593e8cbc854",
    prompt: "Cyberpunk portrait with neon reflections, photorealistic, dramatic rim lighting, rain drops, moody atmosphere",
    model: "DreamCanvas XL v3.2",
    likes: 5291, views: 41033, comments: 298,
    height: "medium", category: "portraits", createdAt: "4h ago",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=900&fit=crop&q=80",
    title: "Birth of Stars",
    creatorId: "028de50a-6194-4a32-a610-22655e7b1c3c",
    merchId: "453ac245-d62c-41ee-a5af-c622c2fe67e3",
    prompt: "Cosmic nebula with newborn stars, deep space photography style, vibrant purple and gold colors, ultra detailed, NASA-inspired",
    model: "DreamCanvas XL v3.2",
    likes: 7120, views: 53200, comments: 421,
    height: "xtall", category: "sci-fi", createdAt: "6h ago",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=500&fit=crop&q=80",
    title: "Chromatic Waves",
    creatorId: "76f69027-62a5-4a61-9d8d-470ebd5204ec",
    prompt: "Abstract flowing liquid art, chromatic aberration, iridescent metallic surface, macro photography style, vibrant spectrum",
    model: "DreamCanvas v2.8",
    likes: 2156, views: 18700, comments: 87,
    height: "short", category: "abstract", createdAt: "8h ago",
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=750&fit=crop&q=80",
    title: "Spirit of the Wild",
    creatorId: "542b4ceb-13d9-4bd6-9600-fab2f58af018",
    merchId: "d96a9dbe-f8b4-4d56-b251-aecc35db7147",
    prompt: "Majestic tiger spirit animal dissolving into particles of light, ethereal, magical realism, studio lighting, award winning",
    model: "DreamCanvas XL v3.2",
    likes: 4589, views: 35600, comments: 203,
    height: "tall", category: "animals", createdAt: "10h ago",
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1480044965905-02098d419e96?w=600&h=400&fit=crop&q=80",
    title: "Neo Tokyo 2099",
    creatorId: "f87c5f80-c24c-498a-a930-648bb1bd4e81",
    prompt: "Futuristic cyberpunk cityscape at night, flying cars, holographic advertisements, rain-soaked streets, blade runner inspired",
    model: "DreamCanvas XL v3.2",
    likes: 6834, views: 48100, comments: 356,
    height: "short", category: "sci-fi", createdAt: "12h ago",
  },
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=850&fit=crop&q=80",
    title: "Celestial Peaks",
    creatorId: "438969c3-f9db-4795-ba8d-9825e6fa9309",
    merchId: "a4dc3d2e-1136-47ad-919b-0998c10c2925",
    prompt: "Majestic mountain range under the milky way, aurora borealis, long exposure photography style, crystalline lake reflection",
    model: "DreamCanvas v2.8",
    likes: 8901, views: 67800, comments: 512,
    height: "xtall", category: "landscapes", createdAt: "14h ago",
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=700&fit=crop&q=80",
    title: "Deep Blue Dreams",
    creatorId: "18143590-b192-45fe-8f9b-2005e2a6e2db",
    prompt: "Ethereal underwater scene with bioluminescent jellyfish, coral cathedral, divine light rays, fantasy ocean kingdom",
    model: "DreamCanvas XL v3.2",
    likes: 3245, views: 24900, comments: 156,
    height: "tall", category: "fantasy", createdAt: "16h ago",
  },
  {
    id: "9",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=600&fit=crop&q=80",
    title: "Quantum Garden",
    creatorId: "6c2f4a49-9e65-48aa-b237-19de59a426bf",
    prompt: "Surreal garden where flowers are made of crystallized light, impossible geometry, M.C. Escher meets nature, vivid colors",
    model: "DreamCanvas XL v3.2",
    likes: 4102, views: 31200, comments: 189,
    height: "medium", category: "abstract", createdAt: "18h ago",
  },
  {
    id: "10",
    url: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=600&h=800&fit=crop&q=80",
    title: "Last Samurai's Dream",
    creatorId: "87e8e477-0661-475f-b760-999de1375acf",
    merchId: "c9a55f2f-dccc-4565-8d18-42067bc70701",
    prompt: "Samurai warrior meditating under cherry blossoms, ukiyo-e art style meets photorealism, dramatic composition, golden hour",
    model: "DreamCanvas XL v3.2",
    likes: 6578, views: 49300, comments: 387,
    height: "tall", category: "fantasy", createdAt: "20h ago",
  },
  {
    id: "11",
    url: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=600&h=500&fit=crop&q=80",
    title: "Mechanical Heart",
    creatorId: "6bec2491-d51e-4df2-9f52-7a547be260d6",
    prompt: "Steampunk robot with a glowing heart, intricate brass gears, Victorian laboratory, warm amber lighting, cinematic",
    model: "DreamCanvas v2.8",
    likes: 2890, views: 21500, comments: 134,
    height: "short", category: "sci-fi", createdAt: "22h ago",
  },
  {
    id: "12",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&q=80",
    title: "Moonlit Guardian",
    creatorId: "542b4ceb-13d9-4bd6-9600-fab2f58af018",
    prompt: "Wolf howling at a luminous full moon, northern lights dancing, snow-covered pine forest, photorealistic, mystical energy",
    model: "DreamCanvas XL v3.2",
    likes: 5432, views: 39800, comments: 267,
    height: "tall", category: "animals", createdAt: "1d ago",
  },
  {
    id: "13",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=650&fit=crop&q=80",
    title: "Forgotten Temple",
    creatorId: "1adef157-1763-42d9-8828-aca1f4401379",
    merchId: "f0da4e3f-866d-4149-b943-fd5822640211",
    prompt: "Ancient temple overgrown with glowing vines, rays of light through broken ceiling, atmospheric fog, Indiana Jones vibes",
    model: "DreamCanvas XL v3.2",
    likes: 4210, views: 33100, comments: 198,
    height: "medium", category: "fantasy", createdAt: "1d ago",
  },
  {
    id: "14",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=450&fit=crop&q=80",
    title: "Aurora Cascade",
    creatorId: "438969c3-f9db-4795-ba8d-9825e6fa9309",
    prompt: "Spectacular aurora borealis over Icelandic landscape, waterfall in foreground, long exposure, night photography masterpiece",
    model: "DreamCanvas v2.8",
    likes: 9234, views: 72100, comments: 601,
    height: "short", category: "landscapes", createdAt: "1d ago",
  },
  {
    id: "15",
    url: "https://images.unsplash.com/photo-1534312527009-56c7016453e6?w=600&h=900&fit=crop&q=80",
    title: "Dragon's Awakening",
    creatorId: "7a6e7e11-1833-4771-90ad-4c68c872ab2e",
    merchId: "ef68cd43-5ea4-4e53-90b9-275ecc9bcdc3",
    prompt: "Enormous dragon emerging from a volcano, wings spread wide, molten lava, epic scale, dark fantasy, cinematic composition",
    model: "DreamCanvas XL v3.2",
    likes: 11203, views: 89400, comments: 743,
    height: "xtall", category: "fantasy", createdAt: "2d ago",
  },
  {
    id: "16",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=700&fit=crop&q=80",
    title: "Electric Dreams",
    creatorId: "45d6ba65-b95f-40f9-aba9-52fa9d7805da",
    merchId: "2f23ef76-2add-42df-ac5c-4658167f4aa1",
    prompt: "Synthwave retro portrait, glowing grid lines, sunset gradient sky, chrome reflections, 80s aesthetic, outrun style",
    model: "DreamCanvas v2.8",
    likes: 3678, views: 27900, comments: 172,
    height: "tall", category: "portraits", createdAt: "2d ago",
  },
];

export const CATEGORIES = [
  "all",
  "trending",
  "fantasy",
  "portraits",
  "landscapes",
  "abstract",
  "sci-fi",
  "animals",
] as const;
