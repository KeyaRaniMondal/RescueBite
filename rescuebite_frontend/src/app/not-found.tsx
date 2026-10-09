import { ArrowLeft, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Page Not Found | RescueBite",
  description: "The page you're looking for doesn't exist on RescueBite.",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-amber/15 text-brand-amber">
            <SearchX className="size-6" />
          </span>
          <p className="font-heading mt-2 text-5xl font-bold text-foreground">
            404
          </p>
          <CardTitle className="mt-1">This plate is empty</CardTitle>
          <CardDescription>
            The page you&apos;re looking for was moved, removed, or never
            existed. Let&apos;s get you back to the good food.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col items-stretch gap-2">
          <Button size="lg" className="w-full" render={<Link href="/" />}>
            <ArrowLeft />
            Back to home
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            render={<Link href="/browse" />}
          >
            Browse surplus food
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
