"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Droplet,
  Coins,
  Activity,
  Calendar,
  Loader2,
  RefreshCw,
  Building,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/LanguageContext";

type PortalUser = {
  id: string;
  name: string;
  email: string;
  aadhaar: string;
  tokens: number;
};

type BloodDonation = {
  id: string;
  hospital_name: string;
  donation_date: string;
  status: string;
  tokens_awarded: number;
};

type BloodTest = {
  id: string;
  hospital_name: string;
  test_date: string;
  result_summary: string;
  status: string;
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  completed: CheckCircle2,
  rejected: XCircle,
};

export default function UserDashboard() {
  const router = useRouter();
  const { t } = useLanguage();

  const [session, setSession] = useState<PortalUser | null>(null);
  const [activeTab, setActiveTab] = useState<"donations" | "tests">("donations");

  const [donations, setDonations] = useState<BloodDonation[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);

  const [tests, setTests] = useState<BloodTest[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);

  // ── Auth guard ──
  useEffect(() => {
    const raw = localStorage.getItem("user_session");
    if (!raw) {
      router.replace("/auth/user");
      return;
    }
    setSession(JSON.parse(raw));
  }, [router]);

  // ── Data fetchers ──
  const fetchDonations = useCallback(async () => {
    if (!session) return;
    setLoadingDonations(true);
    const { data } = await supabase
      .from("blood_donations")
      .select("*")
      .eq("user_id", session.id)
      .order("donation_date", { ascending: false });
    
    setDonations(data ?? []);
    setLoadingDonations(false);
  }, [session]);

  const fetchTests = useCallback(async () => {
    if (!session) return;
    setLoadingTests(true);
    const { data } = await supabase
      .from("blood_tests")
      .select("*")
      .eq("user_id", session.id)
      .order("test_date", { ascending: false });
    
    setTests(data ?? []);
    setLoadingTests(false);
  }, [session]);

  // Also refresh user data specifically to get fresh token count
  const refreshUserSession = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("portal_users")
      .select("*")
      .eq("id", session.id)
      .single();
    if (data) {
      setSession(data);
      localStorage.setItem("user_session", JSON.stringify(data));
    }
  }, [session]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  function handleLogout() {
    localStorage.removeItem("user_session");
    router.push("/");
  }

  function handleRefreshAll() {
    refreshUserSession();
    fetchDonations();
    fetchTests();
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* ── Top bar ── */}
      <div className="border-b border-border/40 bg-card/60 px-4 py-3 sticky top-0 z-10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
              <User className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("welcomeHospital")}</p>
              <p className="font-semibold text-foreground">{session.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {t("userDashboard")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("aadhaarNumber")}: <span className="font-mono text-foreground font-medium">{session.aadhaar}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshAll} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </Button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:gap-6">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-rose-500/10 to-transparent p-6 shadow-sm">
            <div className="absolute -right-4 -top-4 rounded-full bg-rose-500/10 p-4">
              <Droplet className="h-12 w-12 text-rose-500/20" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-rose-600 mb-1">{t("totalDonations")}</p>
              <p className="text-4xl font-bold text-foreground">
                {donations.filter(d => d.status === "completed").length}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-amber-500/10 to-transparent p-6 shadow-sm">
            <div className="absolute -right-4 -top-4 rounded-full bg-amber-500/10 p-4">
              <Coins className="h-12 w-12 text-amber-500/20" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-amber-600 mb-1">{t("tokensEarned")}</p>
              <p className="text-4xl font-bold text-foreground">
                {session.tokens}
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1 max-w-sm">
          {[
            { key: "donations", label: t("donationHistory"), icon: Droplet },
            { key: "tests", label: t("bloodTestHistory"), icon: Activity },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "donations" | "tests")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${activeTab === key && key === 'donations' ? 'text-rose-500' : ''} ${activeTab === key && key === 'tests' ? 'text-sky-500' : ''}`} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Donation History Tab ── */}
        {activeTab === "donations" && (
          <div className="space-y-4">
            {loadingDonations ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : donations.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center bg-card">
                <Droplet className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">{t("noDonationHistory")}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {donations.map((d) => {
                  const StatusIcon = STATUS_ICONS[d.status.toLowerCase()] || CheckCircle2;
                  const isCompleted = d.status === "completed";
                  return (
                    <div key={d.id} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">{d.hospital_name || "Unknown Hospital"}</span>
                        </div>
                        <span className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-amber-500/20 bg-amber-500/10 text-amber-600"
                        }`}>
                          <StatusIcon className="h-3 w-3" />
                          {d.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(d.donation_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {isCompleted && (
                          <div className="flex items-center gap-1.5 mt-2 rounded-lg bg-amber-500/10 p-2 border border-amber-500/20">
                            <Coins className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-600">+{d.tokens_awarded} Tokens Earned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Blood Test History Tab ── */}
        {activeTab === "tests" && (
          <div className="space-y-4">
            {loadingTests ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tests.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center bg-card">
                <Activity className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">{t("noTestHistory")}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tests.map((tRec) => {
                  const StatusIcon = STATUS_ICONS[tRec.status.toLowerCase()] || CheckCircle2;
                  const isCompleted = tRec.status === "completed";
                  return (
                    <div key={tRec.id} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">{tRec.hospital_name || "Unknown Hospital"}</span>
                        </div>
                        <span className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-amber-500/20 bg-amber-500/10 text-amber-600"
                        }`}>
                          <StatusIcon className="h-3 w-3" />
                          {tRec.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(tRec.test_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {isCompleted && tRec.result_summary && (
                          <div className="rounded-lg bg-sky-500/5 p-3 border border-sky-500/10">
                            <p className="text-xs font-semibold text-sky-700 mb-1">{t("result")}</p>
                            <p className="text-sm text-foreground">{tRec.result_summary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
