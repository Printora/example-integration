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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Printora Integration Example</CardTitle>
          <CardDescription className="text-base">
            Demonstration of partner integration with Printora API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Create a session with design image and customer data</li>
              <li>Redirect to Printora design editor</li>
              <li>Customer completes checkout</li>
              <li>Receive webhook events for order lifecycle</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/create-session" className="w-full">
            <Button className="w-full" size="lg">
              Create Session
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
