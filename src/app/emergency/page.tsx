"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, MapPin, Phone, Siren, Droplet, AlertTriangle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";
import { supabase } from "@/lib/supabaseClient";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// Mock hospitals data
const HOSPITALS = [
  { id: 1, name: "City General Hospital", address: "100 Medical Drive", lat: 28.6139, lng: 77.209, bloodTypes: ["A+", "B+", "O+", "AB+", "O-"], phone: "+1-555-0101" },
  { id: 2, name: "St. Mary's Blood Bank", address: "250 Health Ave", lat: 28.6229, lng: 77.219, bloodTypes: ["A+", "A-", "B-", "O+", "O-"], phone: "+1-555-0102" },
  { id: 3, name: "Red Cross Center", address: "45 Charity Lane", lat: 28.6339, lng: 77.229, bloodTypes: ["B+", "B-", "AB+", "AB-", "O+"], phone: "+1-555-0103" },
  { id: 4, name: "Metro Emergency Hospital", address: "800 Main Blvd", lat: 28.6449, lng: 77.239, bloodTypes: ["A+", "B+", "O+", "O-", "AB-"], phone: "+1-555-0104" },
  { id: 5, name: "Central Blood Bank", address: "12 Donor Street", lat: 28.6559, lng: 77.249, bloodTypes: ["A-", "B+", "AB+", "O+", "O-"], phone: "+1-555-0105" },
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const EmergencyDashboard = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"blood" | "accident">("blood");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBlood, setSelectedBlood] = useState("");
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);
  const [bloodRequested, setBloodRequested] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          toast.error(t("locationDenied"));
          setCoords({ lat: 28.6139, lng: 77.209 });
        }
      );
    } else {
      setCoords({ lat: 28.6139, lng: 77.209 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNearestHospitals = useCallback(() => {
    if (!coords || !selectedBlood) return [];
    return HOSPITALS
      .filter((h) => h.bloodTypes.includes(selectedBlood))
      .map((h) => ({ ...h, distance: haversineDistance(coords.lat, coords.lng, h.lat, h.lng) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [coords, selectedBlood]);

  const handleAmbulance = async () => {
    if (!userName.trim() || !userPhone.trim()) {
      toast.error(t("enterNamePhoneFirst"));
      return;
    }

    const { error } = await supabase.from("blood_requests").insert([{
      request_type: "ambulance",
      name: userName,
      phone: userPhone,
      lat: coords?.lat,
      lng: coords?.lng,
    }]);

    if (error) {
      console.error("Supabase insert error:", error);
      toast.error("Failed to send ambulance request. Please try again or call emergency services directly.");
      return;
    }

    setAmbulanceRequested(true);
    toast.success(t("ambulanceRequestSent"));
  };

  const handleBloodRequest = async () => {
    if (!userName.trim() || !userPhone.trim()) {
      toast.error(t("enterNamePhoneFirst"));
      return;
    }
    if (!selectedBlood) {
      toast.error(t("selectBloodTypeFirst"));
      return;
    }

    const { error } = await supabase.from("blood_requests").insert([{
      request_type: "blood",
      name: userName,
      phone: userPhone,
      blood_group: selectedBlood,
      lat: coords?.lat,
      lng: coords?.lng,
    }]);

    if (error) {
      console.error("Supabase insert error:", error);
      toast.error("Failed to send blood request. Please try again.");
      return;
    }

    setBloodRequested(true);
    toast.success(t("bloodRequestToast", { blood: selectedBlood }));
  };

  return (
    <div className="min-h-screen px-3 py-5 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-serif text-xl font-bold text-foreground sm:text-2xl">{t("emergencyDashboard")}</h1>
        </div>

        {/* Location Status */}
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">
            {coords ? `${t("locationPrefix")}: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : t("gettingLocation")}
          </span>
        </div>

        {/* User Info Inputs */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("enterYourName")}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              placeholder={t("enterYourPhone")}
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mb-5 flex gap-2 sm:mb-6">
          <Button
            variant={mode === "blood" ? "hero" : "hero-outline"}
            size="default"
            className="flex-1 text-xs sm:text-base"
            onClick={() => { setMode("blood"); setAmbulanceRequested(false); setBloodRequested(false); }}
          >
            <Droplet className="mr-1 h-4 w-4 shrink-0" /> {t("requestBlood")}
          </Button>
          <Button
            variant={mode === "accident" ? "hero" : "hero-outline"}
            size="default"
            className="flex-1 text-xs sm:text-base"
            onClick={() => { setMode("accident"); setSelectedBlood(""); setBloodRequested(false); }}
          >
            <AlertTriangle className="mr-1 h-4 w-4 shrink-0" /> {t("reportAccident")}
          </Button>
        </div>

        {/* Blood Request Mode */}
        {mode === "blood" && (
          <div className="flex flex-col gap-3 sm:gap-4">
            {!bloodRequested ? (
              <>
                <Select onValueChange={setSelectedBlood}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectBloodType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedBlood && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-muted-foreground">{t("nearestHospitalsWith")} {selectedBlood}:</p>
                    {getNearestHospitals().map((h) => (
                      <Card key={h.id}>
                        <CardHeader className="px-4 pb-1 pt-3 sm:px-6 sm:pb-2 sm:pt-4">
                          <CardTitle className="text-sm sm:text-base">{h.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 px-4 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-4">
                          <div className="min-w-0">
                            <p className="truncate text-xs text-muted-foreground sm:text-sm">{h.address}</p>
                            <p className="text-xs font-medium text-primary">{h.distance.toFixed(1)} {t("kmAway")}</p>
                          </div>
                          <Button
                            variant="hero"
                            size="sm"
                            className="w-full shrink-0 sm:w-auto"
                            onClick={() => window.open(`tel:${h.phone}`)}
                          >
                            <Phone className="mr-1 h-3 w-3" /> {t("call")}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    {getNearestHospitals().length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">{t("noHospitalsFound")}</p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Button 
                        variant="hero" 
                        size="lg" 
                        className="w-full py-6 text-base font-bold shadow-lg shadow-primary/20"
                        onClick={handleBloodRequest}
                      >
                        <Droplet className="mr-2 h-5 w-5 fill-current" />
                        {t("requestForBloodNow", { blood: selectedBlood })}
                      </Button>
                      <p className="mt-2 text-center text-[10px] text-muted-foreground sm:text-xs">
                        {t("notifyDonorsMsg")}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card className="w-full text-center">
                <CardContent className="flex flex-col items-center gap-3 px-4 pt-6 pb-6 sm:gap-4 sm:px-6 sm:pt-8 sm:pb-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 sm:h-16 sm:w-16">
                    <Droplet className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-foreground sm:text-xl">{t("bloodRequestSent")}</h2>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {t("bloodRequestSentMsg", { blood: selectedBlood })}
                  </p>
                  <div className="rounded-lg bg-muted p-3 w-full max-w-xs">
                    <p className="text-xs font-semibold text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userPhone}</p>
                    <p className="mt-1 inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                      {t("bloodType")}: {selectedBlood}
                    </p>
                  </div>
                  <Button 
                    variant="link" 
                    className="text-xs" 
                    onClick={() => setBloodRequested(false)}
                  >
                    {t("sendAnotherRequest")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Accident Mode */}
        {mode === "accident" && (
          <div className="flex flex-col items-center gap-4 pt-5 sm:gap-6 sm:pt-8">
            {!ambulanceRequested ? (
              <>
                <Siren className="h-14 w-14 text-primary animate-pulse-glow sm:h-20 sm:w-20" />
                <Button
                  variant="emergency"
                  size="xl"
                  className="w-full py-5 text-base sm:py-8 sm:text-xl"
                  onClick={handleAmbulance}
                >
                  {t("requestAmbulanceFast")}
                </Button>
                {coords && (
                  <p className="text-[11px] text-muted-foreground text-center sm:text-xs">
                    {t("coordsSharedMsg", { lat: coords.lat.toFixed(4), lng: coords.lng.toFixed(4) })}
                  </p>
                )}
              </>
            ) : (
              <Card className="w-full text-center">
                <CardContent className="flex flex-col items-center gap-3 px-4 pt-6 pb-6 sm:gap-4 sm:px-6 sm:pt-8 sm:pb-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 sm:h-16 sm:w-16">
                    <Siren className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-foreground sm:text-xl">{t("requestSent")}</h2>
                  <p className="text-sm text-muted-foreground sm:text-base">{t("ambulanceOnWay")}</p>
                  {userName && (
                    <p className="text-xs font-medium text-foreground">{userName} &mdash; {userPhone}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {t("locationLabel")}: {coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyDashboard;
