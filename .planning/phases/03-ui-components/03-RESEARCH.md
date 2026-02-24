# Phase 3: UI Components & Callback Pages - Research

**Researched:** 2026-02-24
**Domain:** shadcn/ui, React Server Components, Form Validation, Callback Page Patterns
**Confidence:** HIGH

## Summary

Phase 3 focuses on implementing user interface components for the session creation form and callback pages (success/failed) using shadcn/ui component library. This phase replaces the basic HTML form from Phase 2 with polished, accessible components while maintaining the existing Server Actions and useActionState pattern for form handling.

The most critical insight from research is that shadcn/ui is **not a traditional npm package** — it's a CLI tool that copies component source code directly into your project. This means you own the components and can modify them freely. The library combines Radix UI primitives (for accessibility), Tailwind CSS (for styling), and class-variance-authority (for variant management) into a cohesive system.

Another important finding is that **this project already has Tailwind CSS v4 installed** via `@tailwindcss/postcss`. The new v4 uses `@import "tailwindcss"` instead of the traditional `@tailwind` directives and uses a `@theme` block for CSS-based theming. This differs from most shadcn/ui documentation examples which assume Tailwind v3.

**Primary recommendation:** Install shadcn/ui CLI, add Card, Input, Button, and Label components for the session form, and create Server Component callback pages at `/callback/success/page.tsx` and `/callback/failed/page.tsx` that use `searchParams` prop to display order confirmation.

## User Constraints

### Locked Decisions (from Phases 1 & 2)
- **Environment validation:** T3 Env with `@t3-oss/env-nextjs`
- **Form handling:** Server Actions with React 19's `useActionState` hook
- **Validation:** Zod schemas for both client and server-side validation
- **TypeScript:** Strict type safety for all components
- **Import style:** Path alias `@/*` configured in tsconfig.json

### Claude's Discretion
- shadcn/ui component selection and configuration
- Visual design choices (colors, spacing, layout)
- Component file organization (components/ui/ vs app/components/)
- Form component composition pattern
- Callback page content and layout

### Deferred Ideas (OUT OF SCOPE)
- Advanced form features (auto-save, draft persistence)
- Multi-step form wizard
- Real-time form validation feedback with React Hook Form
- Analytics/tracking on callback pages
- Email notifications on callbacks
- Dashboard UI for viewing events

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui | latest | Component library CLI | Not a package - CLI that copies component code into your project |
| Radix UI | latest | Accessible primitives | Foundation for shadcn/ui components, WAI-ARIA compliant |
| Tailwind CSS | 4.x (PostCSS) | Utility-first styling | Already installed in project via `@tailwindcss/postcss` |
| class-variance-authority | latest | Component variant management | Type-safe variant definitions for shadcn/ui components |
| clsx | latest | Conditional class names | Combines with tailwind-merge for className utilities |
| tailwind-merge | latest | Smart Tailwind class merging | Prevents class conflicts in shadcn/ui components |
| lucide-react | latest | Icon library | Default icon set for shadcn/ui |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React 19 | 19.2.3 | useActionState for form state | Already installed, handles pending/error states |
| Zod | 4.3.6 | Schema validation | Already in use from Phase 2 |
| Next.js | 16.1.6 | App Router, searchParams | Already installed, for callback pages |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui | Chakra UI, Mantine | shadcn/ui gives code ownership; others are packages you can't modify |
| Card component | Custom div layout | Card provides consistent styling with header/content/footer structure |
| Native HTML inputs | Formik + Yup | shadcn/ui Input + useActionState is simpler for this use case |

**Installation:**
```bash
# Install shadcn/ui CLI and initialize
npx shadcn@latest init

# Install utility dependencies (not always required - CLI may add these)
npm install clsx tailwind-merge class-variance-authority lucide-react

# Add individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
```

## Architecture Patterns

### Recommended Project Structure
```
components/
└── ui/
    ├── button.tsx        # shadcn/ui Button component
    ├── card.tsx          # shadcn/ui Card component
    ├── input.tsx         # shadcn/ui Input component
    ├── label.tsx         # shadcn/ui Label component
    └── utils.ts          # cn() utility for className merging

lib/
├── actions/
│   └── create-session.ts  # EXISTING: Server Action from Phase 2
└── utils.ts               # NEW: cn() function if components/ui/utils.ts not created

app/
├── create-session/
│   └── page.tsx            # UPDATE: Replace HTML form with shadcn/ui components
└── callback/
    ├── success/
    │   └── page.tsx        # NEW: Success callback page
    └── failed/
        └── page.tsx        # NEW: Failed callback page
```

### Pattern 1: shadcn/ui Initialization with CLI
**What:** Run `npx shadcn@latest init` to set up components.json configuration
**When to use:** First time setting up shadcn/ui in a project
**What it creates:**
- `components.json` - Configuration file for component paths and styling
- `components/ui/` - Directory for component files
- `lib/utils.ts` - The `cn()` utility function

**Important:** The CLI will prompt for:
- Style system (select "Tailwind CSS" - already configured)
- Base color (select "Zinc" or "Slate" for neutral design)
- CSS variables for colors (select "yes" for easier theming)

### Pattern 2: The `cn()` Utility Function
**What:** Combines clsx (conditional classes) and tailwind-merge (conflict resolution)
**When to use:** All className composition in shadcn/ui components
**Example:**
```typescript
// Source: shadcn/ui documentation
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage in component:
className={cn(
  "base-classes",
  isActive && "active-classes",
  className  // User-provided classes override defaults
)}
```

**Why this matters:** `twMerge` ensures that conflicting Tailwind classes (like `w-10` and `w-20`) are resolved correctly — the last one wins. Without this, both classes would be in the output and the first one would apply.

### Pattern 3: Card Component for Form Layout
**What:** Use Card component with CardHeader, CardContent, CardFooter for consistent form layout
**When to use:** All form pages that need structured layout
**Example:**
```typescript
// Source: shadcn/ui component pattern
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function SessionCreateForm() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Printora Session</CardTitle>
        <CardDescription>Enter design details to create a new editing session</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="session-form">
          {/* Form fields go here */}
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="session-form">Create Session</Button>
      </CardFooter>
    </Card>
  )
}
```

### Pattern 4: Input + Label Pattern
**What:** Pair Label component with Input for accessible form fields
**When to use:** All form inputs that need labels
**Example:**
```typescript
// Source: shadcn/ui documentation
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

<div className="space-y-2">
  <Label htmlFor="imageUrl">Design Image URL</Label>
  <Input
    id="imageUrl"
    name="imageUrl"
    type="url"
    placeholder="https://example.com/design.png"
    required
  />
</div>
```

**Key points:**
- `htmlFor` on Label matches `id` on Input for accessibility
- `name` attribute on Input matches form data keys for Server Actions
- Required fields use `required` attribute for browser validation

### Pattern 5: Callback Page with searchParams
**What:** Server Component pages that read URL query parameters via searchParams prop
**When to use:** Callback pages that receive data via URL parameters
**Example:**
```typescript
// Source: Next.js 16 App Router documentation
// File: app/callback/success/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface SuccessPageProps {
  searchParams: Promise<{
    sessionId?: string
    orderId?: string
    amount?: string
  }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  // In Next.js 15/16, searchParams is a Promise
  const { sessionId, orderId, amount } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessionId && <p>Session: {sessionId}</p>}
          {orderId && <p>Order: {orderId}</p>}
          {amount && <p>Amount: {amount}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Critical for Next.js 15/16:** The `searchParams` prop is now a Promise and must be awaited.

### Pattern 6: Form with useActionState and shadcn/ui
**What:** Combine React 19's useActionState hook with shadcn/ui form components
**When to use:** Form submissions with server-side validation
**Example:**
```typescript
// Source: Based on Phase 2 create-session action
"use client"

import { useActionState } from "react"
import { createSessionAction, type FormState } from "@/lib/actions/create-session"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const initialState: FormState = { success: false }

export default function SessionCreatePage() {
  const [state, formAction, isPending] = useActionState(
    createSessionAction,
    initialState
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Create Printora Session</CardTitle>
          <CardDescription>Enter design details to create a new editing session</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Design Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/design.png"
                disabled={isPending}
                aria-describedby={state.errors?.imageUrl ? "imageUrl-error" : undefined}
              />
              {state.errors?.imageUrl && (
                <p id="imageUrl-error" className="text-sm text-red-500">
                  {state.errors.imageUrl[0]}
                </p>
              )}
            </div>

            {/* Additional fields... */}
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form={formAction} disabled={isPending} className="w-full">
            {isPending ? "Creating..." : "Create Session"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Importing shadcn/ui as npm package:** shadcn/ui is NOT installed via `npm install shadcn-ui` — you run the CLI and it copies component code into your project
- **Using useActionState on form element:** The `form` attribute on Button should reference the form's ID, not use `action={formAction}` on both
- **Forgetting to await searchParams:** In Next.js 15/16, searchParams is a Promise — must use `await` or React's `use()` hook
- **Mixing client and server patterns:** Keep callback pages as Server Components, form pages as Client Components for useActionState

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form layout structure | Custom div containers | Card component | Consistent header/content/footer structure, built-in styling |
| Accessible form inputs | Custom input with label | Input + Label components | Built-in ARIA support, keyboard navigation |
| Button states and variants | Custom button CSS | Button component | Disabled states, variants (default/outline/ghost), sizes |
| Class name merging | String concatenation | `cn()` utility | Prevents Tailwind class conflicts, handles conditional classes |
| Icon rendering | Custom SVG components | lucide-react icons | Tree-shakeable, consistent sizing, accessible by default |

**Key insight:** shadcn/ui components are not black boxes — they're code you own. The utility libraries (clsx, tailwind-merge, CVA) handle complex edge cases in className composition that custom solutions typically miss.

## Common Pitfalls

### Pitfall 1: Treating shadcn/ui as an npm Package
**What goes wrong:** Developer runs `npm install shadcn-ui` and tries to import from it
**Why it happens:** Most libraries are npm packages; shadcn/ui's approach is unique
**How to avoid:** Always use the CLI: `npx shadcn@latest add <component-name>` — this copies the component source into `components/ui/`
**Warning signs:** Import errors like `"@/components/ui/button" doesn't exist`

### Pitfall 2: Tailwind CSS v4 vs v3 Configuration
**What goes wrong:** Following shadcn/ui docs for v3 (tailwind.config.js) when project uses v4 (@import syntax)
**Why it happens:** This project uses Tailwind v4 with `@tailwindcss/postcss`, but most documentation assumes v3
**How to avoid:** This project already has Tailwind v4 configured. When running shadcn init, ensure it detects the existing PostCSS config. The `components.json` will reference the correct CSS file.
**Warning signs:** Build errors about `@tailwind` directives not being found

### Pitfall 3: Forgetting to Await searchParams in Next.js 15/16
**What goes wrong:** Callback page tries to access `searchParams.sessionId` directly and gets undefined
**Why it happens:** Next.js 15/16 made searchParams a Promise for performance
**How to avoid:** Always use `const params = await searchParams` at the start of Server Component pages
**Warning signs:** All searchParams values showing as undefined despite being in URL

### Pitfall 4: Form Action on Both Form and Button
**What goes wrong:** Form submits twice or `isPending` doesn't work correctly
**Why it happens:** Confusion about where to attach the action — it goes on the `<form>` element, Button uses `form` attribute
**How to avoid:** Use `<form action={formAction}>` and `<Button type="submit" form="form-id">`
**Warning signs:** Double submissions, pending state not showing

### Pitfall 5: Missing aria-describedby for Error Messages
**What goes wrong:** Screen readers don't announce validation errors
**Why it happens:** Error messages exist but aren't linked to inputs
**How to avoid:** Add `aria-describedby={errorId}` to Input and `id={errorId}` to error paragraph
**Warning signs:** Accessibility audit failures, keyboard-only users can't see errors

### Pitfall 6: Client Component Confusion for Callback Pages
**What goes wrong:** Adding "use client" to callback pages unnecessarily
**Why it happens:** Habit from other pages, or trying to use hooks
**How to avoid:** Keep callback pages as Server Components — use `await searchParams` directly
**Warning signs:** `useSearchParams` from `next/navigation` being used when `searchParams` prop is available

## Code Examples

Verified patterns from official sources:

### Installing shadcn/ui Components
```bash
# Source: shadcn/ui CLI documentation
# Initialize (creates components.json)
npx shadcn@latest init

# Add individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
```

### Updated Session Creation Page with shadcn/ui
```typescript
// File: app/create-session/page.tsx
"use client"

import { useActionState } from "react"
import { createSessionAction, type FormState } from "@/lib/actions/create-session"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const initialState: FormState = { success: false }

export default function SessionCreatePage() {
  const [state, formAction, isPending] = useActionState(
    createSessionAction,
    initialState
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Create Printora Session</CardTitle>
          <CardDescription>Enter design details to create a new editing session</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="session-form" action={formAction} className="space-y-4">
            {/* Design Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Design Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/design.png"
                required
                disabled={isPending}
                aria-describedby={state.errors?.imageUrl ? "imageUrl-error" : undefined}
              />
              {state.errors?.imageUrl && (
                <p id="imageUrl-error" className="text-sm text-red-500">
                  {state.errors.imageUrl[0]}
                </p>
              )}
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                disabled={isPending}
                aria-describedby={state.errors?.name ? "name-error" : undefined}
              />
              {state.errors?.name && (
                <p id="name-error" className="text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {/* Customer Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Customer Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="customer@example.com"
                required
                disabled={isPending}
                aria-describedby={state.errors?.email ? "email-error" : undefined}
              />
              {state.errors?.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* General Form Error */}
            {state.errors?._form && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{state.errors._form[0]}</p>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="session-form"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Creating Session..." : "Create Session"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

### Success Callback Page
```typescript
// File: app/callback/success/page.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

interface SuccessPageProps {
  searchParams: Promise<{
    sessionId?: string
    orderId?: string
    amount?: string
    status?: string
  }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { sessionId, orderId, amount } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Order Confirmed!</CardTitle>
          <CardDescription>Your order has been successfully processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessionId && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-gray-600">Session ID:</span>
              <span className="text-sm font-medium">{sessionId}</span>
            </div>
          )}
          {orderId && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-gray-600">Order ID:</span>
              <span className="text-sm font-medium">{orderId}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-medium">{amount}</span>
            </div>
          )}
          <div className="pt-4 text-center text-sm text-gray-500">
            You can close this page or return to the home page.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Failed Callback Page
```typescript
// File: app/callback/failed/page.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

interface FailedPageProps {
  searchParams: Promise<{
    reason?: string
    code?: string
  }>
}

export default async function FailedPage({ searchParams }: FailedPageProps) {
  const { reason, code } = await searchParams

  const errorMessage = reason || "The checkout process was cancelled or failed."

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Payment Failed</CardTitle>
          <CardDescription>We were unable to process your order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-center text-sm text-gray-600">{errorMessage}</p>
          {code && (
            <p className="text-center text-xs text-gray-500">Error code: {code}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/create-session">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

### Utility Function (lib/utils.ts)
```typescript
// Source: shadcn/ui documentation
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Tailwind v4 Configuration (Already in Project)
```css
/* File: app/globals.css - Already configured in project */
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* Dark mode support already configured */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Traditional npm component packages | shadcn/ui CLI (copy-paste components) | 2023+ | You own the component code, can modify freely |
| Manual CSS classes for variants | class-variance-authority (CVA) | 2024+ | Type-safe variant definitions, better DX |
| @tailwind directives (v3) | @import "tailwindcss" (v4) | 2025 | Simplified CSS-based configuration |
| useState for form state | useActionState (React 19) | React 19 | Built-in pending/error states, less boilerplate |
| useRouter for query params | searchParams prop (awaited) | Next.js 15+ | Server Component access to URL params |

**Deprecated/outdated:**
- **tailwind.config.js for v4:** Tailwind v4 uses CSS-based `@theme` blocks, not JS config
- **useFormState from react-dom:** Use `useActionState` from React 19 instead
- **Direct searchParams access:** In Next.js 15/16, searchParams must be awaited

## Open Questions

1. **Exact Printora Callback URL Parameters**
   - What we know: Callback pages will be called with some URL parameters
   - What's unclear: Exact parameter names (e.g., `session_id`, `orderId`, `transaction_id`)
   - Recommendation: Use generic parameter names in TypeScript interfaces with optional properties, adjust based on actual Printora API

2. **Callback Page Security Validation**
   - What we know: Success page receives order confirmation data
   - What's unclear: Whether we need to verify the callback (prevent direct URL access)
   - Recommendation: For demo purposes, displaying URL parameters is sufficient. Production should validate via API

3. **shadcn/ui Theme Configuration**
   - What we know: Project has Tailwind v4 with CSS variables
   - What's unclear: Whether shadcn/ui init will correctly detect v4 configuration
   - Recommendation: Run `npx shadcn@latest init` and verify components.json points to correct CSS file

## Sources

### Primary (HIGH confidence)
- **shadcn/ui Official Documentation** - https://ui.shadcn.com (Component installation, usage patterns, CLI commands)
- **Next.js 16 Documentation** - https://nextjs.org/docs/app (App Router, searchParams as Promises, Server Components)
- **React 19 Documentation** - useActionState hook for form state management
- **Tailwind CSS v4 Documentation** - @import syntax, @theme configuration
- **Existing Project Files** - app/create-session/page.tsx, lib/actions/create-session.ts, lib/env.ts

### Secondary (MEDIUM confidence)
- [shadcn/ui Complete Installation Guide](https://dev.to/og-whisper/shadcn-ui-complete-installation-guide-2025) - CLI usage, component organization (verified with official docs)
- [shadcn/ui Form Components Guide](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - Form patterns with Zod validation (January 2026)
- [Next.js Callback Page Patterns](https://www.nextjs.cn/docs/app/building-your-application/routing/pages-and-layouts) - Chinese documentation for App Router patterns

### Tertiary (LOW confidence)
- Various Chinese technical blogs (CSDN, Juejin) - Used for verifying shadcn/ui trends and patterns, cross-referenced with official docs
- Web search for Tailwind v4 migration patterns - Newer version, less documentation available

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - shadcn/ui CLI pattern well-documented, Tailwind v4 in project is verified
- Architecture: HIGH - Component structure patterns verified against official shadcn/ui docs
- Pitfalls: HIGH - Common pitfalls well-documented across multiple sources, especially for Next.js 15/16 changes

**Research date:** 2026-02-24
**Valid until:** 2026-03-26 (30 days - shadcn/ui ecosystem is stable, Tailwind v4 is current)
