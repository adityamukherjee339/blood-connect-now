"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, MapPin, Phone, Siren, Droplet, AlertTriangle } from "lucide-react";
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
  const [mode, setMode] = useState<"blood" | "accident">("blood");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBlood, setSelectedBlood] = useState("");
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          toast.error("Location access denied. Using default location.");
          setCoords({ lat: 28.6139, lng: 77.209 });
        }
      );
    } else {
      setCoords({ lat: 28.6139, lng: 77.209 });
    }
  }, []);

  const getNearestHospitals = useCallback(() => {
    if (!coords || !selectedBlood) return [];
    return HOSPITALS
      .filter((h) => h.bloodTypes.includes(selectedBlood))
      .map((h) => ({ ...h, distance: haversineDistance(coords.lat, coords.lng, h.lat, h.lng) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [coords, selectedBlood]);

  const handleAmbulance = () => {
    setAmbulanceRequested(true);
    toast.success("Ambulance request sent! Help is on the way.");
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-serif text-2xl font-bold text-foreground">Emergency Dashboard</h1>
        </div>

        {/* Location Status */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          {coords ? `Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Getting location..."}
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={mode === "blood" ? "hero" : "hero-outline"}
            size="lg"
            className="flex-1"
            onClick={() => { setMode("blood"); setAmbulanceRequested(false); }}
          >
            <Droplet className="mr-1 h-4 w-4" /> Request Blood
          </Button>
          <Button
            variant={mode === "accident" ? "hero" : "hero-outline"}
            size="lg"
            className="flex-1"
            onClick={() => { setMode("accident"); setSelectedBlood(""); }}
          >
            <AlertTriangle className="mr-1 h-4 w-4" /> Report Accident
          </Button>
        </div>

        {/* Blood Request Mode */}
        {mode === "blood" && (
          <div className="flex flex-col gap-4">
            <Select onValueChange={setSelectedBlood}>
              <SelectTrigger>
                <SelectValue placeholder="Select needed blood type" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((bg) => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedBlood && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">Nearest hospitals with {selectedBlood}:</p>
                {getNearestHospitals().map((h) => (
                  <Card key={h.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{h.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{h.address}</p>
                        <p className="text-xs text-primary font-medium">{h.distance.toFixed(1)} km away</p>
                      </div>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => window.open(`tel:${h.phone}`)}
                      >
                        <Phone className="mr-1 h-3 w-3" /> Call
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {getNearestHospitals().length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">No hospitals found with this blood type nearby.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Accident Mode */}
        {mode === "accident" && (
          <div className="flex flex-col items-center gap-6 pt-8">
            {!ambulanceRequested ? (
              <>
                <Siren className="h-20 w-20 text-primary animate-pulse-glow" />
                <Button
                  variant="emergency"
                  size="xl"
                  className="w-full py-8 text-xl"
                  onClick={handleAmbulance}
                >
                  🚑 Request Ambulance Fast
                </Button>
                {coords && (
                  <p className="text-xs text-muted-foreground text-center">
                    Your coordinates ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}) will be shared with emergency services.
                  </p>
                )}
              </>
            ) : (
              <Card className="w-full text-center">
                <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Siren className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-foreground">Request Sent!</h2>
                  <p className="text-muted-foreground">Emergency services have been notified. Help is on the way.</p>
                  <p className="text-xs text-muted-foreground">
                    Location: {coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)}
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
