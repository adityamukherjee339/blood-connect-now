"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hospital, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function HospitalAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [hospitalName, setHospitalName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

      if (mode === "signup") {
      // Validation
      if (!hospitalName.trim()) return setError("Hospital name is required.");
      if (!licenseNo.trim()) return setError("License number is required.");
      if (!email.trim()) return setError("Email is required.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      if (password !== confirmPassword) return setError("Passwords do not match.");

      setLoading(true);
      // Check if email already exists
      const { data: existing } = await supabase
        .from("hospitals")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (existing) {
        setLoading(false);
        return setError("This email is already registered. Please log in.");
      }

      const { data, error: insertError } = await supabase
        .from("hospitals")
        .insert({ name: hospitalName.trim(), license_no: licenseNo.trim(), email: email.trim().toLowerCase(), password })
        .select()
        .single();

      setLoading(false);
      if (insertError) return setError(insertError.message);

      // Store session
      localStorage.setItem("hospital_session", JSON.stringify({ id: data.id, name: data.name, email: data.email }));
      router.push("/hospital/dashboard");

    } else {
      // Login
      if (!email.trim() || !password) return setError("Please fill in all fields.");

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("hospitals")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      setLoading(false);
      if (fetchError || !data) return setError("No hospital found with this email.");
      if (data.password !== password) return setError("Incorrect password.");

      localStorage.setItem("hospital_session", JSON.stringify({ id: data.id, name: data.name, email: data.email }));
      router.push("/hospital/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute left-4 top-20 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20">
            <Hospital className="h-8 w-8 text-rose-500" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Hospital Portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage blood inventory and donor requests
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-xl shadow-black/10">
          {/* Tab Toggle */}
          <div className="mb-6 flex rounded-lg bg-muted p-1">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" /> Login
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Hospital Name</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. City General Hospital"
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">License Number</label>
                  <input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="e.g. LIC-12345"
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-mono"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hospital@example.com"
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-rose-500/25 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {mode === "login" ? "Login as Hospital" : "Create Hospital Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
