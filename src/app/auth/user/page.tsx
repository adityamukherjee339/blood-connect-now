"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function UserAuthPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name || !email || !password || !aadhaar) {
          toast.error("Please fill in all required fields.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("portal_users")
          .insert({ name, email, phone, password, aadhaar })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") { // Unique violation
            toast.error("Email or Aadhaar already registered.");
          } else {
            console.error(error);
            toast.error("Signup failed. Please try again.");
          }
          setLoading(false);
          return;
        }

        toast.success("Account created successfully!");
        localStorage.setItem("user_session", JSON.stringify(data));
        router.push("/user/dashboard");
      } else {
        if (!email || !password) {
          toast.error("Please provide email and password.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("portal_users")
          .select("*")
          .eq("email", email)
          .eq("password", password)
          .single();

        if (error || !data) {
          toast.error("Invalid email or password.");
          setLoading(false);
          return;
        }

        toast.success("Login successful!");
        localStorage.setItem("user_session", JSON.stringify(data));
        router.push("/user/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute left-4 top-20 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 ring-1 ring-sky-500/20">
            <User className="h-8 w-8 text-sky-500" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              User Portal
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Donate blood, request help & track your history
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-xl shadow-black/10">
          {/* Tab Toggle */}
          <div className="mb-6 flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleAuth}>
            {mode === "signup" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">{t("aadhaarNumber")}</label>
                  <input
                    type="text"
                    required
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    placeholder={t("enterAadhaar")}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
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
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-sky-500/25 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
