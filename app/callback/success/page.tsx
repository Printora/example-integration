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
import { CheckCircle2 } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ sessionId?: string; orderId?: string }>;
}

export default async function SuccessCallbackPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { sessionId, orderId } = searchParams;

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Order Confirmed!</CardTitle>
          <CardDescription>
            Thank you for your order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-900">Order ID</p>
              <p className="text-sm text-green-700 font-mono mt-1">{orderId}</p>
            </div>
          )}
          {sessionId && (
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">Session ID</p>
              <p className="text-sm text-gray-600 font-mono mt-1">{sessionId}</p>
            </div>
          )}
          <p className="text-sm text-gray-600 text-center">
            You will receive a confirmation email shortly.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/create-session" className="w-full">
            <Button variant="outline" className="w-full">
              Create Another Session
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
