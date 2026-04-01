"use client";

import { Droplet } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Index = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Droplet className="h-9 w-9 text-primary" fill="hsl(var(--primary))" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Blood Connect</h1>
          <p className="mt-2 text-muted-foreground">
            Quickly connect donors and patients in emergencies.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex w-full flex-col gap-3">
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={() => router.push("/donate")}
          >
            Donate Blood
          </Button>
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={() => router.push("/book-test")}
          >
            Book Blood Test
          </Button>
          <Button
            variant="hero-outline"
            size="xl"
            className="w-full"
            onClick={() => router.push("/emergency")}
          >
            Need Blood (Emergency)
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-12 pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Donors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Requests</p>
          </div>
        </div>

        {/* Link */}
        <Button variant="link" className="text-muted-foreground underline" onClick={() => router.push("/records")}>
          View all records
        </Button>
      </div>
    </div>
  );
};

export default Index;
