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
import { XCircle, AlertCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    sessionId?: string;
    error_code?: string;
    error_message?: string;
  }>;
}

export default async function FailedCallbackPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { sessionId, error_code, error_message } = searchParams;

  const isCancelled = error_code === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isCancelled ? "bg-gray-100" : "bg-red-100"
          }`}>
            {isCancelled ? (
              <XCircle className="h-6 w-6 text-gray-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <CardTitle className={`text-2xl ${
            isCancelled ? "text-gray-700" : "text-red-700"
          }`}>
            {isCancelled ? "Order Cancelled" : "Checkout Failed"}
          </CardTitle>
          <CardDescription>
            {isCancelled
              ? "You cancelled the checkout process"
              : "There was an issue processing your order"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCancelled && error_message && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error_message}</p>
            </div>
          )}
          {sessionId && (
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">Session ID</p>
              <p className="text-sm text-gray-600 font-mono mt-1">{sessionId}</p>
            </div>
          )}
          <p className="text-sm text-gray-600 text-center">
            {isCancelled
              ? "You can start a new session anytime."
              : "Please try again or contact support if the issue persists."}
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Go Home
            </Button>
          </Link>
          <Link href="/create-session" className="flex-1">
            <Button className="w-full">
              Try Again
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
