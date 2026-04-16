"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Hospital,
  LogOut,
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Droplets,
  ArrowRightLeft,
  X,
  Loader2,
  RefreshCw,
  Siren,
  MapPin,
  Phone,
  User,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/LanguageContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type HospitalRecord = { id: string; name: string; email: string };

type ExchangeRequest = {
  id: string;
  sender_hospital_id: string;
  receiver_hospital_id: string;
  blood_group_needed: string;
  blood_group_offered: string;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  sender?: { name: string };
};

type EmergencyRequest = {
  id: string;
  name: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  status: string;
  accepted_by_hospital_id: string | null;
  accepted_by_hospital_name: string | null;
  created_at: string;
};

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  accepted: { label: "Accepted", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
};

export default function HospitalDashboard() {
  const router = useRouter();
  const { t } = useLanguage();

  const [session, setSession] = useState<HospitalRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"partners" | "incoming" | "emergency">("partners");

  // Partners
  const [partners, setPartners] = useState<HospitalRecord[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  // Incoming exchange requests
  const [incoming, setIncoming] = useState<ExchangeRequest[]>([]);
  const [loadingIncoming, setLoadingIncoming] = useState(true);

  // Emergency requests
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(true);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<HospitalRecord | null>(null);
  const [needed, setNeeded] = useState(BLOOD_GROUPS[0]);
  const [offered, setOffered] = useState(BLOOD_GROUPS[2]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Realtime pulse refs
  const prevIncomingCountRef = useRef(0);
  const prevEmergencyCountRef = useRef(0);
  const [incomingPulse, setIncomingPulse] = useState(false);
  const [emergencyPulse, setEmergencyPulse] = useState(false);

  // Keep a ref to session so the polling interval always has the latest value
  const sessionRef = useRef<HospitalRecord | null>(null);
  useEffect(() => { sessionRef.current = session; }, [session]);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("hospital_session");
    if (!raw) { router.replace("/auth/hospital"); return; }
    setSession(JSON.parse(raw));
  }, [router]);

  // ── Data fetchers ──────────────────────────────────────────────────────────
  const fetchPartners = useCallback(async () => {
    if (!session) return;
    setLoadingPartners(true);
    const { data } = await supabase
      .from("hospitals")
      .select("id, name, email")
      .neq("id", session.id)
      .order("name");
    setPartners(data ?? []);
    setLoadingPartners(false);
  }, [session]);

  const fetchIncoming = useCallback(async () => {
    if (!session) return;
    setLoadingIncoming(true);
    const { data } = await supabase
      .from("hospital_blood_requests")
      .select("*")
      .eq("receiver_hospital_id", session.id)
      .order("created_at", { ascending: false });

    if (!data) { setIncoming([]); setLoadingIncoming(false); return; }

    const senderIds = [...new Set(data.map((r) => r.sender_hospital_id))];
    const { data: senders } = await supabase
      .from("hospitals")
      .select("id, name")
      .in("id", senderIds);

    const senderMap = Object.fromEntries((senders ?? []).map((s) => [s.id, s.name]));
    setIncoming(data.map((r) => ({ ...r, sender: { name: senderMap[r.sender_hospital_id] ?? "Unknown" } })));
    setLoadingIncoming(false);
  }, [session]);

  const fetchEmergencies = useCallback(async (background = false) => {
    if (!session) return;
    if (!background) setLoadingEmergencies(true);
    const { data } = await supabase
      .from("blood_requests")
      .select("id, name, phone, lat, lng, status, accepted_by_hospital_id, accepted_by_hospital_name, created_at")
      .eq("request_type", "ambulance")
      .order("created_at", { ascending: false });
    setEmergencies(data ?? []);
    if (!background) setLoadingEmergencies(false);
  }, [session]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);
  useEffect(() => { fetchIncoming(); }, [fetchIncoming]);
  useEffect(() => { fetchEmergencies(false); }, [fetchEmergencies]);

  // ── Auto-refresh emergencies every 1 second (session via ref → no stale closure) ──
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!sessionRef.current) return;
      const { data } = await supabase
        .from("blood_requests")
        .select("id, name, phone, lat, lng, status, accepted_by_hospital_id, accepted_by_hospital_name, created_at")
        .eq("request_type", "ambulance")
        .order("created_at", { ascending: false });
      setEmergencies(data ?? []);
    }, 1000);
    return () => clearInterval(interval);
  }, []); // empty deps → created once, never re-created

  // ── Realtime subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;

    // Blood exchange requests
    const ch1 = supabase
      .channel(`hbr-receiver-${session.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "hospital_blood_requests" }, () => fetchIncoming())
      .subscribe();

    // Emergency ambulance requests
    const ch2 = supabase
      .channel("emergency-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "blood_requests" }, () => fetchEmergencies(true))
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, [session, fetchIncoming, fetchEmergencies]);

  // Pulse badge for incoming exchange requests
  useEffect(() => {
    const pending = incoming.filter(r => r.status === "pending").length;
    if (pending > prevIncomingCountRef.current) {
      setIncomingPulse(true);
      setTimeout(() => setIncomingPulse(false), 2000);
    }
    prevIncomingCountRef.current = pending;
  }, [incoming]);

  // Pulse badge for new emergency requests
  useEffect(() => {
    const pending = emergencies.filter(e => e.status === "pending").length;
    if (pending > prevEmergencyCountRef.current) {
      setEmergencyPulse(true);
      setTimeout(() => setEmergencyPulse(false), 3000);
    }
    prevEmergencyCountRef.current = pending;
  }, [emergencies]);

  // ── Actions ────────────────────────────────────────────────────────────────
  async function sendExchangeRequest() {
    if (!session || !selectedPartner) return;
    setSending(true);
    await supabase.from("hospital_blood_requests").insert({
      sender_hospital_id: session.id,
      receiver_hospital_id: selectedPartner.id,
      blood_group_needed: needed,
      blood_group_offered: offered,
      message: message.trim() || null,
    });
    setSending(false);
    setSendSuccess(true);
    setTimeout(() => { setDialogOpen(false); setSendSuccess(false); setMessage(""); }, 1500);
  }

  async function updateExchangeStatus(requestId: string, status: "accepted" | "rejected") {
    await supabase.from("hospital_blood_requests").update({ status }).eq("id", requestId);
    fetchIncoming();
  }

  async function acceptEmergency(emergency: EmergencyRequest) {
    if (!session) return;
    setDispatchingId(emergency.id);
    await supabase
      .from("blood_requests")
      .update({
        status: "accepted",
        accepted_by_hospital_id: session.id,
        accepted_by_hospital_name: session.name,
      })
      .eq("id", emergency.id);
    setDispatchingId(null);
    fetchEmergencies();
  }

  function handleLogout() {
    localStorage.removeItem("hospital_session");
    router.push("/");
  }

  function openDialog(partner: HospitalRecord) {
    setSelectedPartner(partner);
    setNeeded(BLOOD_GROUPS[0]);
    setOffered(BLOOD_GROUPS[2]);
    setMessage("");
    setSendSuccess(false);
    setDialogOpen(true);
  }

  if (!session) return null;

  const pendingEmergencies = emergencies.filter(e => e.status === "pending").length;
  const pendingIncoming = incoming.filter(r => r.status === "pending").length;

  return (
    <div className="min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-border/40 bg-card/60 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
              <Hospital className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("welcomeHospital")}</p>
              <p className="font-semibold text-foreground">{session.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-6 font-serif text-2xl font-bold text-foreground">{t("hospitalDashboard")}</h1>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1">
          {[
            { key: "partners", label: t("partnerHospitals"), icon: ArrowRightLeft, badge: 0 },
            { key: "incoming", label: t("incomingRequests"), icon: Inbox, badge: pendingIncoming, pulse: incomingPulse },
            { key: "emergency", label: t("emergencyAlerts"), icon: Siren, badge: pendingEmergencies, pulse: emergencyPulse, urgent: true },
          ].map(({ key, label, icon: Icon, badge, pulse, urgent }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "partners" | "incoming" | "emergency")}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon className={`h-4 w-4 ${urgent && badge > 0 ? "text-rose-500" : ""}`} />
              <span className="hidden sm:inline">{label}</span>
              {badge > 0 && (
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white transition-all ${urgent ? "bg-rose-500" : "bg-rose-500"
                  } ${pulse ? "scale-125 ring-2 ring-rose-400/60" : ""}`}>
                  {badge}
                </span>
              )}
              {/* Urgent pulse dot */}
              {urgent && badge > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Partner Hospitals Tab ──────────────────────────────────────────── */}
        {activeTab === "partners" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{partners.length} hospital{partners.length !== 1 ? "s" : ""} registered</p>
              <button onClick={fetchPartners} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
            {loadingPartners ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : partners.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
                <Hospital className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("noPartnerHospitals")}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {partners.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
                        <Hospital className="h-5 w-5 text-rose-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => openDialog(p)} className="gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs shadow-sm shadow-rose-500/20">
                      <Send className="h-3.5 w-3.5" /> {t("requestExchange")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Incoming Exchange Requests Tab ─────────────────────────────────── */}
        {activeTab === "incoming" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{incoming.length} request{incoming.length !== 1 ? "s" : ""} received</p>
              <button onClick={fetchIncoming} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
            {loadingIncoming ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : incoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("noIncomingRequests")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {incoming.map((req) => {
                  const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={req.id} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Hospital className="h-4 w-4 text-rose-500" />
                            <span className="font-semibold text-foreground">{req.sender?.name ?? "Unknown"}</span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5">
                              <Droplets className="h-3.5 w-3.5 text-rose-500" />
                              <span className="text-xs text-muted-foreground">{t("needs")}:</span>
                              <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-600">{req.blood_group_needed}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-xs text-muted-foreground">{t("offers")}:</span>
                              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600">{req.blood_group_offered}</span>
                            </div>
                          </div>
                          {req.message && <p className="text-xs text-muted-foreground italic">"{req.message}"</p>}
                          <p className="text-xs text-muted-foreground/60">{new Date(req.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                            <StatusIcon className="h-3.5 w-3.5" /> {cfg.label}
                          </span>
                          {req.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => updateExchangeStatus(req.id, "accepted")} className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5" /> {t("accept")}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => updateExchangeStatus(req.id, "rejected")} className="gap-1.5 border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs">
                                <XCircle className="h-3.5 w-3.5" /> {t("reject")}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Emergency Alerts Tab ───────────────────────────────────────────── */}
        {activeTab === "emergency" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {pendingEmergencies > 0 && (
                  <span className="flex h-2 w-2">
                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                  </span>
                )}
                <p className="text-sm text-muted-foreground">
                  {emergencies.length} alert{emergencies.length !== 1 ? "s" : ""}
                  {pendingEmergencies > 0 && <span className="ml-1 font-semibold text-rose-500">· {pendingEmergencies} pending</span>}
                </p>
              </div>
              <button onClick={fetchEmergencies} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            {loadingEmergencies ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : emergencies.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
                <Siren className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("noEmergencies")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {emergencies.map((em) => {
                  const isPending = em.status === "pending";
                  const acceptedByMe = em.accepted_by_hospital_id === session.id;
                  const isDispatching = dispatchingId === em.id;

                  return (
                    <div
                      key={em.id}
                      className={`rounded-xl border p-5 shadow-sm transition-all ${isPending
                        ? "border-rose-500/30 bg-rose-500/5 shadow-rose-500/10"
                        : "border-border/60 bg-card"
                        }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        {/* Left — reporter info */}
                        <div className="flex flex-col gap-2">
                          {/* Status banner */}
                          <div className="flex items-center gap-2">
                            {isPending ? (
                              <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-500">
                                <span className="relative flex h-2 w-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                                </span>
                                LIVE · Needs Ambulance
                              </span>
                            ) : (
                              <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${acceptedByMe
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                : "border-sky-500/30 bg-sky-500/10 text-sky-600"
                                }`}>
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {acceptedByMe ? t("dispatchedByUs") : `${t("dispatchedByOther")} ${em.accepted_by_hospital_name ?? "another hospital"}`}
                              </span>
                            )}
                          </div>

                          {/* Reporter details */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-semibold text-foreground">{em.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <a href={`tel:${em.phone}`} className="text-sm text-primary hover:underline">{em.phone}</a>
                            </div>
                            {(em.lat && em.lng) && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                <a
                                  href={`https://maps.google.com/?q=${em.lat},${em.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-sky-500 hover:underline"
                                >
                                  {em.lat.toFixed(4)}, {em.lng.toFixed(4)} · Open in Maps
                                </a>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground/60">{new Date(em.created_at).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Right — action */}
                        {isPending && (
                          <Button
                            onClick={() => acceptEmergency(em)}
                            disabled={isDispatching}
                            className="gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-lg shadow-rose-500/25 disabled:opacity-60"
                          >
                            {isDispatching
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Siren className="h-4 w-4" />
                            }
                            {t("acceptAndDispatch")}
                          </Button>
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

      {/* ── Request Exchange Dialog ─────────────────────────────────────────── */}
      {dialogOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl">
            <button onClick={() => setDialogOpen(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>

            {sendSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <p className="font-semibold text-foreground">{t("requestSentSuccess")}</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
                    <Send className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("requestExchange")} →</p>
                    <p className="font-semibold text-foreground">{selectedPartner.name}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">{t("bloodNeeded")}</label>
                    <div className="flex flex-wrap gap-2">
                      {BLOOD_GROUPS.map((bg) => (
                        <button key={bg} onClick={() => setNeeded(bg)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${needed === bg ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30" : "bg-muted text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                            }`}>{bg}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">{t("bloodOffered")}</label>
                    <div className="flex flex-wrap gap-2">
                      {BLOOD_GROUPS.map((bg) => (
                        <button key={bg} onClick={() => setOffered(bg)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${offered === bg ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
                            }`}>{bg}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">{t("messageOptional")}</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
                      placeholder="Any additional details..."
                      className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none transition-all" />
                  </div>

                  <Button onClick={sendExchangeRequest} disabled={sending}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-lg shadow-rose-500/25 disabled:opacity-60">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    {t("sendRequest")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
