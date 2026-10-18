import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BrandAmbientBackground } from "@/components/brand-ambient-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Access Restricted | TalentX",
  description: "You do not have the required permissions to view this page.",
};

export default function NotAuthorizedPage() {
  return (
    <BrandAmbientBackground>
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-2 pb-2">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="size-7" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              You do not have the required permissions to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            If you believe this is an error, please switch to an account with the appropriate permissions or return to your dashboard.
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto")}
            >
              Go to Dashboard
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
            >
              Return to Login
            </Link>
          </CardFooter>
        </Card>
      </main>
    </BrandAmbientBackground>
  );
}
