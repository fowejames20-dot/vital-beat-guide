import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Heart,
  Info,
  LogOut,
  MessageCircle,
  Pill,
  UserRound,
  Watch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { to: "/resultats", label: "Résultats", icon: <BarChart3 /> },
  { to: "/montre", label: "Montre", icon: <Watch /> },
  { to: "/medicaments", label: "Traitement", icon: <Pill /> },
  { to: "/rendez-vous", label: "RDV", icon: <CalendarDays /> },
  { to: "/informations", label: "Infos", icon: <Info /> },
  { to: "/contact", label: "Contact", icon: <MessageCircle /> },
] as const;

export function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${dark ? "text-primary" : "text-primary-foreground"}`}>
      <span className="relative flex size-9 items-center justify-center rounded-lg bg-primary">
        <Heart className="size-5 fill-current text-primary-foreground" />
        <Activity className="absolute size-4 text-mint" />
      </span>
      <span className="font-display text-lg font-bold">HeartGuard</span>
    </div>
  );
}

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase text-primary">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
    </div>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="min-h-[100svh] bg-background pb-28 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-3 px-5">
          <BrandMark dark />
          <div className="hidden items-center gap-1 lg:flex">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${
                  pathname === item.to ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="[&_svg]:size-4">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/profil"
              aria-label="Mon profil"
              className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            >
              <UserRound className="size-5" />
            </Link>
            <Button variant="outline" size="sm" onClick={signOut} className="h-10 gap-2">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">{children}</div>

      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-7 gap-1 rounded-xl bg-primary p-2 shadow-soft lg:hidden"
      >
        {[...items, { to: "/profil", label: "Profil", icon: <UserRound /> } as const].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={`flex h-13 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold ${
              pathname === item.to
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "text-primary-foreground/65"
            }`}
          >
            <span className="[&_svg]:size-4">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
