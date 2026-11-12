"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex max-w-2xl flex-col gap-4">
      <p className="font-data text-sm text-danger">Error</p>
      <h1 className="font-display text-5xl text-balance sm:text-6xl">This page hit a problem.</h1>
      <p className="text-lg text-pretty text-muted">
        Nothing you did caused it. Try loading it again, or go back to the{" "}
        <Link href="/" className="text-foreground underline underline-offset-4">
          home page
        </Link>
        .
      </p>
      <div>
        <Button onClick={() => retry()}>Try again</Button>
      </div>
    </div>
  );
}
