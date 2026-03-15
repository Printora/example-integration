import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Printora Partner Integration
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Example implementation of all 3 integration flows from the Partner API
          </p>
        </div>

        {/* Integration Flows */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Flow A */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <CardTitle className="text-lg">Flow A &mdash; Image Upload</CardTitle>
              <CardDescription>
                User provides a custom image URL. Printora opens the design editor with that image.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <code className="block rounded bg-gray-100 p-2 text-xs text-gray-600">
                POST /api/v1/partner-session<br />
                {`{ "imageUrl": "https://..." }`}
              </code>
            </CardContent>
            <CardFooter>
              <Link href="/create-session" className="w-full">
                <Button variant="outline" className="w-full">
                  Try Flow A
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Flow C */}
          <Card className="flex flex-col border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <CardTitle className="text-lg">Flow C &mdash; Direct Merch</CardTitle>
              <CardDescription>
                User lands directly on a specific merch item. Session created with <code className="text-xs">merchId</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <code className="block rounded bg-emerald-100/50 p-2 text-xs text-gray-600">
                POST /api/v1/partner-session<br />
                {`{ "merchId": "uuid-..." }`}
              </code>
            </CardContent>
            <CardFooter>
              <Link href="/ai-image-app" className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Try Flow C (DreamCanvas)
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              All flows follow the same lifecycle after session creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                {
                  step: "1",
                  title: "Create Session",
                  desc: "Your backend sends imageUrl, creatorId, or merchId to Printora API",
                },
                {
                  step: "2",
                  title: "Redirect to Editor",
                  desc: "User is redirected to Printora's product editor / storefront",
                },
                {
                  step: "3",
                  title: "Customer Checkout",
                  desc: "Customer picks products, customizes, and completes payment",
                },
                {
                  step: "4",
                  title: "Webhook Events",
                  desc: "Receive order.created, order.paid, order.shipped, order.delivered",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/create-session">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Session Form</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Manual session creation with image URL input</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Webhook Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Real-time webhook event monitoring</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/ai-image-app">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">DreamCanvas Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Full AI gallery with creator storefronts</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
