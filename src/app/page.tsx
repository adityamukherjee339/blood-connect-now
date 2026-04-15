"use client";

import { Droplet } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const Index = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [donorCount, setDonorCount] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      const { count: dCount } = await supabase
        .from("donors")
        .select("*", { count: "exact", head: true });
      const { count: rCount } = await supabase
        .from("blood_requests")
        .select("*", { count: "exact", head: true });

      setDonorCount(dCount ?? 0);
      setRequestCount(rCount ?? 0);
    }
    fetchCounts();
  }, []);

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
            {t("homeTagline")}
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
            {t("donateBlood")}
          </Button>
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={() => router.push("/book-test")}
          >
            {t("bookBloodTest")}
          </Button>
          <Button
            variant="hero-outline"
            size="xl"
            className="w-full"
            onClick={() => router.push("/emergency")}
          >
            {t("needBloodEmergency")}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-12 pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {donorCount !== null ? donorCount : "..."}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("donors")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {requestCount !== null ? requestCount : "..."}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("requests")}</p>
          </div>
        </div>

        {/* Link */}
        <Button variant="link" className="text-muted-foreground underline" onClick={() => router.push("/records")}>
          {t("viewAllRecords")}
        </Button>
      </div>
    </div>
  );
};

export default Index;
