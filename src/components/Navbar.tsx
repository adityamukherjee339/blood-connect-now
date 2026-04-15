"use client";

import { Droplet, Globe, Check, LogIn, Hospital, Building2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import type { Locale } from "@/lib/translations";

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

const AUTH_ROLES = [
  {
    key: "hospital" as const,
    icon: Hospital,
    route: "/auth/hospital",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    key: "bloodBank" as const,
    icon: Building2,
    route: "/auth/blood-bank",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    key: "user" as const,
    icon: User,
    route: "/auth/user",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
];

export function Navbar() {
  const router = useRouter();
  const { locale, setLocale, t } = useLanguage();

  const selectedLanguage = LANGUAGES.find((l) => l.code === locale);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Left — Brand */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Droplet
              className="h-4.5 w-4.5 text-primary"
              fill="hsl(var(--primary))"
            />
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-foreground">
            Blood Connect
          </span>
        </button>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          {/* Login / Sign Up Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary border border-border/50 hover:border-primary/40 transition-all duration-200"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t("loginSignUp")}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                {t("loginSignUp")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AUTH_ROLES.map(({ key, icon: Icon, route, color, bg }) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => router.push(route)}
                  className="flex cursor-pointer items-center gap-3 py-2.5"
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <span className="font-medium">{t(key)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {selectedLanguage?.flag} {selectedLanguage?.label}
                </span>
                <span className="sm:hidden">{selectedLanguage?.flag}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Language
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  {locale === lang.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
